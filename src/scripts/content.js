/** Scan in the Instagram tab; closing the popup must not stop or lose a scan. */
(() => {
  // The popup can inject into a tab opened before extension installation.
  if (globalThis.__unfollowTrackerScanner) return;

  class InstagramApiError extends Error {
    constructor(message, status = 0) {
      super(message);
      this.status = status;
    }
  }

  class InstagramScanner {
    constructor() {
      this.isScanning = false;
      this.isUnfollowing = false;
      this.accountId = null;
      this.scanId = null;
      this.progress = null;
      this.error = null;
      this.avatarCache = new Map();
      this.avatarQueue = [];
      this.activeAvatars = 0;
      this.config = {
        requestDelay: 2000,
        batchDelay: 10000,
        maxRetries: 3,
        rateLimitDelay: 30000,
        maxCooldown: 300000,
        requestTimeout: 30000,
        pageLimits: { following: 250, followers: 1500 },
      };

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'getStatus') {
          sendResponse(this.getStatus());
        } else if (message.action === 'startScan') {
          // Acknowledge immediately, not after a potentially minutes-long scan.
          sendResponse(this.startScan(message.accountId));
        } else if (message.action === 'unfollow') {
          this.unfollowUser(message).then(sendResponse, (error) => {
            sendResponse({ ok: false, error: error.message });
          });
          return true;
        } else if (message.action === 'loadAvatar') {
          this.loadAvatar(message).then(sendResponse, () => sendResponse({ ok: false }));
          return true;
        }
        return false;
      });
    }

    getStatus() {
      const accountId = this.getLoggedInUserId();
      const sameAccount = accountId === this.accountId;
      return {
        ok: true,
        panelProtocol: 3,
        accountId,
        scanId: sameAccount ? this.scanId : null,
        isScanning: sameAccount && this.isScanning,
        progress: sameAccount ? this.progress : null,
        error: sameAccount ? this.error : null,
      };
    }

    startScan(expectedAccountId) {
      const accountId = this.getLoggedInUserId();
      if (!accountId || accountId !== expectedAccountId) {
        return { ok: false, error: 'Your Instagram account changed. Reopen the extension and try again.' };
      }
      if (this.isScanning) {
        return this.accountId === accountId
          ? { ok: true, scanId: this.scanId, accountId }
          : { ok: false, error: 'The previous account scan is stopping. Please try again shortly.' };
      }
      if (this.isUnfollowing) {
        return { ok: false, error: 'Wait for the unfollow request to finish before scanning.' };
      }
      this.accountId = accountId;
      this.scanId = crypto.randomUUID();
      this.isScanning = true;
      this.error = null;
      this.progress = { phase: 'Starting scan', current: 0, total: null, percentage: 0 };
      this.scanPromise = this.runScan();
      return { ok: true, scanId: this.scanId, accountId };
    }

    async runScan() {
      try {
        await this.backgroundRequest({ action: 'registerScan' });
        // The profile-info endpoint can return 429 while the friendship lists
        // remain accessible. Like upstream, scan the lists directly using the
        // already verified session owner; no profile request is needed.
        const following = await this.getFriendships('following');
        await this.sleep(this.config.requestDelay);
        const followers = await this.getFriendships('followers');
        this.assertAccount();
        const followerIds = new Set(followers.map((user) => user.id));
        const data = {
          accountId: this.accountId,
          scanId: this.scanId,
          username: null,
          complete: true,
          lastScan: Date.now(),
          followers,
          following,
          unfollowers: following.filter((user) => !followerIds.has(user.id)),
        };
        // Save in the service worker before announcing success to the popup.
        await this.backgroundRequest({ action: 'saveScan', data });
        this.isScanning = false;
        this.progress = null;
        this.notify({ type: 'scanComplete', data });
      } catch (error) {
        this.error = error.message;
        this.isScanning = false;
        this.progress = null;
        this.notify({ type: 'scanError', error: error.message });
      }
    }

    async getFriendships(kind) {
      const users = new Map();
      const seenCursors = new Set();
      let cursor = null;
      const phase = kind === 'following' ? 'Fetching following' : 'Fetching followers';
      const rangeStart = kind === 'following' ? 0 : 45;
      const rangeSize = kind === 'following' ? 45 : 50;
      const publishProgress = () => {
        const fraction = 1 - 1 / (1 + users.size / 150);
        this.sendProgress({
          phase,
          current: users.size,
          total: null,
          percentage: Math.round(rangeStart + Math.min(fraction, 0.98) * rangeSize),
        });
      };
      publishProgress();

      for (let page = 0; page < this.config.pageLimits[kind]; page++) {
        const query = new URLSearchParams({ count: '50' });
        if (cursor !== null) query.set('max_id', cursor);
        const data = await this.requestJson(`/api/v1/friendships/${this.accountId}/${kind}/?${query}`, {}, kind);
        if (!Array.isArray(data.users)) {
          throw new Error(`Instagram returned an invalid ${kind} list. Please try again later.`);
        }
        const limited = kind === 'following' ? data.should_limit_list_of_followings : data.should_limit_list_of_followers;
        if (limited === true || (kind === 'following' && Number(data.hidden_following_account_count) > 0)) {
          throw new Error(`Instagram is hiding part of your ${kind} list. The scan is incomplete; your last complete results are preserved.`);
        }
        const previousSize = users.size;
        for (const raw of data.users) {
          const id = this.normalizeId(raw);
          if (typeof raw.username !== 'string' || !/^[a-zA-Z0-9._]+$/.test(raw.username)) {
            throw new Error(`Instagram returned an invalid account in your ${kind} list.`);
          }
          users.set(id, {
            id,
            username: raw.username,
            full_name: typeof raw.full_name === 'string' ? raw.full_name : '',
            profile_pic_url: typeof raw.profile_pic_url === 'string' ? raw.profile_pic_url : '',
            is_verified: Boolean(raw.is_verified),
          });
        }
        publishProgress();

        const next = data.next_max_id == null ? '' : String(data.next_max_id);
        const hasMore = Boolean(next) && data.has_more !== false;
        if (!hasMore) {
          // Without a separate total, a missing continuation cursor cannot
          // establish that a list advertised as incomplete is finished.
          if (data.has_more === true && !next) {
            throw new Error(`Instagram returned an incomplete ${kind} list (${users.size} received, but the next page is missing). Please try again later.`);
          }
          return Array.from(users.values());
        }
        if (users.size === previousSize || seenCursors.has(next)) {
          throw new Error(`Instagram stopped advancing through your ${kind} list. The scan is incomplete; try again later.`);
        }
        seenCursors.add(next);
        cursor = next;
        if (page + 1 < this.config.pageLimits[kind]) {
          await this.sleep(this.config.requestDelay + ((page + 1) % 5 === 0 ? this.config.batchDelay : 0));
        }
      }
      throw new Error(`The ${kind} scan reached its page limit. Incomplete results were not saved.`);
    }

    async requestJson(path, options = {}, listKind = null) {
      const retries = options.method === 'POST' ? 0 : this.config.maxRetries;
      for (let attempt = 0; attempt <= retries; attempt++) {
        this.assertAccount();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.requestTimeout);
        let retryDelay = null;
        try {
          const response = await fetch(`https://www.instagram.com${path}`, {
            ...options,
            headers: { ...this.getHeaders(), ...options.headers },
            credentials: 'same-origin',
            cache: 'no-store',
            signal: controller.signal,
          });
          this.assertAccount();
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const serverDelay = retryAfter === null ? 0 : /^\d+(\.\d+)?$/.test(retryAfter)
              ? Number(retryAfter) * 1000
              : Math.max(0, Date.parse(retryAfter) - Date.now()) || 0;
            retryDelay = Math.max(this.config.rateLimitDelay * 2 ** attempt, serverDelay);
            if (attempt === retries || retryDelay > this.config.maxCooldown) {
              throw new InstagramApiError(`Instagram is limiting requests${listKind ? ` for your ${listKind} list` : ''} (HTTP 429). Please try again later; your last complete scan is preserved.`, 429);
            }
          } else {
            if ([401, 403].includes(response.status) || response.redirected) {
              throw new InstagramApiError('Open Instagram and sign in or complete its verification, then try again.', response.status);
            }
            if (!response.ok) {
              throw new InstagramApiError(`Instagram returned HTTP ${response.status}. Please try again later.`, response.status);
            }
            let data;
            try {
              data = await response.json();
            } catch (error) {
              if (error.name === 'AbortError') throw error;
              throw new Error('Instagram returned an unreadable response. Open Instagram, check your session and try again.');
            }
            this.assertAccount();
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
              throw new Error('Instagram returned an invalid response. Please try again later.');
            }
            if (data.challenge || data.checkpoint_url || /login_required|challenge_required|checkpoint_required/.test(data.message || '')) {
              throw new InstagramApiError('Open Instagram and sign in or complete its verification, then try again.', 403);
            }
            if (data.status && data.status !== 'ok') {
              throw new Error('Instagram could not complete the request. Please check Instagram and try again later.');
            }
            return data;
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Instagram took too long to respond. Please try again.');
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }
        await this.waitForCooldown(retryDelay);
      }
    }

    async waitForCooldown(delay) {
      const progress = this.progress;
      for (let seconds = Math.ceil(delay / 1000); seconds > 0; seconds--) {
        this.assertAccount();
        this.sendProgress({ ...progress, retryInSeconds: seconds });
        await this.sleep(1000);
      }
      this.sendProgress(progress);
    }

    async unfollowUser(message) {
      if (this.isScanning || this.isUnfollowing) {
        throw new Error('Wait for the current request or scan to finish.');
      }
      const accountId = this.getLoggedInUserId();
      if (!accountId || message.accountId !== accountId) {
        throw new Error('Your Instagram account changed. Reopen the extension and scan again.');
      }
      this.isUnfollowing = true;
      this.accountId = accountId;
      try {
        const key = `scanResult:${accountId}`;
        const snapshot = (await chrome.storage.local.get(key))[key];
        const user = snapshot?.complete && snapshot.accountId === accountId && snapshot.scanId === message.scanId
          ? snapshot.unfollowers.find((entry) => entry.id === message.userId && entry.username === message.username)
          : null;
        if (!user) throw new Error('These results are out of date. Run a complete scan before unfollowing.');
        const data = await this.requestJson(`/api/v1/friendships/destroy/${user.id}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: '',
        });
        if (data.status !== 'ok' || data.friendship_status?.following !== false) {
          throw new Error('Instagram did not confirm the unfollow. Check the profile before trying again.');
        }
        const result = await this.backgroundRequest({
          action: 'unfollowComplete',
          scanId: message.scanId,
          userId: user.id,
        });
        return { ok: true, data: result.data };
      } finally {
        this.isUnfollowing = false;
      }
    }

    async loadAvatar({ accountId, url }) {
      const sameAccount = () => accountId && accountId === this.getLoggedInUserId();
      if (!sameAccount() || typeof url !== 'string' || url.length > 4096) return { ok: false };
      const image = new URL(url);
      if (image.protocol !== 'https:' || image.username || image.password || image.port ||
          !/(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(image.hostname)) return { ok: false };

      if (this.avatarAccountId !== accountId) {
        this.avatarCache.clear();
        this.avatarAccountId = accountId;
      }
      if (!this.avatarCache.has(url)) {
        // Memory only: avoid re-downloading a photo when results are re-rendered.
        // Failed/expired images also stay cached, so they cannot cause a retry loop.
        if (this.avatarCache.size >= 64) this.avatarCache.delete(this.avatarCache.keys().next().value);
        const pending = new Promise((resolve) => {
          this.avatarQueue.push(async () => {
            try {
              resolve(sameAccount() ? await this.fetchAvatar(image.href) : null);
            } catch { resolve(null); }
          });
        });
        this.avatarCache.set(url, pending);
        this.drainAvatarQueue();
      }
      const dataUrl = await this.avatarCache.get(url);
      return dataUrl && sameAccount() ? { ok: true, dataUrl } : { ok: false };
    }

    drainAvatarQueue() {
      while (this.activeAvatars < 3 && this.avatarQueue.length) {
        this.activeAvatars++;
        this.avatarQueue.shift()().finally(() => {
          this.activeAvatars--;
          this.drainAvatarQueue();
        });
      }
    }

    async fetchAvatar(url) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const maxBytes = 256 * 1024;
      try {
        // Some CDN photos cannot be embedded from a chrome-extension origin.
        // Use the Instagram tab's ordinary CORS context, without session cookies
        // or API headers. No proxy, host permission, or security override needed.
        const response = await fetch(url, {
          mode: 'cors', credentials: 'omit', referrerPolicy: 'strict-origin',
          redirect: 'error', signal: controller.signal,
        });
        const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
        if (!response.ok || !/^image\/(jpeg|png|webp|avif|gif)$/.test(type) ||
            Number(response.headers.get('content-length')) > maxBytes) return null;
        const reader = response.body.getReader();
        let size = 0;
        let binary = '';
        let chunk = await reader.read();
        while (!chunk.done) {
          const { value } = chunk;
          size += value.byteLength;
          if (size > maxBytes) return null;
          for (let offset = 0; offset < value.length; offset += 8192) {
            binary += String.fromCharCode(...value.subarray(offset, offset + 8192));
          }
          chunk = await reader.read();
        }
        return size ? `data:${type};base64,${btoa(binary)}` : null;
      } finally {
        controller.abort();
        clearTimeout(timeout);
      }
    }

    normalizeId(user) {
      const id = user?.pk_id ?? user?.pk ?? user?.id;
      if ((typeof id === 'number' && !Number.isSafeInteger(id)) || !/^\d+$/.test(String(id))) {
        throw new Error('Instagram returned an invalid account ID. The scan cannot be completed reliably.');
      }
      return String(id);
    }

    getCookie(name) {
      return document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
    }

    getLoggedInUserId() {
      const id = this.getCookie('ds_user_id');
      return /^\d+$/.test(id) ? id : null;
    }

    assertAccount() {
      if (!this.accountId || this.getLoggedInUserId() !== this.accountId) {
        throw new Error('Your Instagram account changed during the request. Reopen the extension and scan again.');
      }
    }

    getHeaders() {
      return {
        Accept: '*/*',
        'X-CSRFToken': this.getCookie('csrftoken'),
        'X-IG-App-ID': '936619743392459',
        'X-ASBD-ID': '129477',
        'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2') || '0',
        'X-Requested-With': 'XMLHttpRequest',
      };
    }

    async backgroundRequest(message) {
      const response = await chrome.runtime.sendMessage({ accountId: this.accountId, scanId: this.scanId, ...message });
      if (!response?.ok) throw new Error(response?.error || 'Unable to save scan state. Reload Instagram and try again.');
      return response;
    }

    notify(message) {
      // Progress/completion must not fail just because the popup is closed.
      chrome.runtime.sendMessage({ accountId: this.accountId, scanId: this.scanId, ...message }).catch(() => {});
    }

    sendProgress(progress) {
      this.progress = progress;
      this.notify({ type: 'scanProgress', data: progress });
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  globalThis.__unfollowTrackerScanner = new InstagramScanner();
})();
