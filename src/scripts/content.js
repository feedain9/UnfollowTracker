/**
 * UnfollowTracker - Content Script
 * Injected into Instagram pages to scan followers/following
 */

class InstagramScanner {
  constructor() {
    this.followers = [];
    this.following = [];
    this.unfollowers = [];
    this.isScanning = false;
    this.userInfo = null;

    this.config = {
      requestDelay: 2000, // 2 seconds between requests to avoid rate limiting
      scrollDelay: 500,
      maxRetries: 3,
    };

    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });

    console.log('[UnfollowTracker] Content script loaded');
  }

  async handleMessage(message, sendResponse) {
    switch (message.action) {
      case 'startScan':
        await this.startScan();
        break;

      case 'unfollow':
        await this.unfollowUser(message.username);
        break;

      case 'getStatus':
        sendResponse({ isScanning: this.isScanning });
        break;
    }
  }

  async startScan() {
    if (this.isScanning) {
      console.log('[UnfollowTracker] Scan already in progress');
      return;
    }

    this.isScanning = true;
    this.followers = [];
    this.following = [];

    try {
      // Get LOGGED IN user info (not the profile page we're viewing)
      this.userInfo = await this.getLoggedInUserInfo();

      if (!this.userInfo) {
        throw new Error('Could not get user info. Make sure you\'re logged in.');
      }

      console.log(`[UnfollowTracker] Starting scan for @${this.userInfo.username} (your account)`);
      console.log(`[UnfollowTracker] Followers: ${this.userInfo.follower_count}, Following: ${this.userInfo.following_count}`);

      // Get followers
      this.sendProgress('Fetching followers', 0, this.userInfo.follower_count || 0);
      this.followers = await this.getFollowers(this.userInfo.pk || this.userInfo.id);

      // Get following
      this.sendProgress('Fetching following', 0, this.userInfo.following_count || 0);
      this.following = await this.getFollowing(this.userInfo.pk || this.userInfo.id);

      // Calculate unfollowers
      this.unfollowers = this.calculateUnfollowers();

      chrome.runtime.sendMessage({
        type: 'scanComplete',
        data: {
          followers: this.followers,
          following: this.following,
          unfollowers: this.unfollowers,
        },
      });

      console.log(`[UnfollowTracker] Scan complete. Found ${this.unfollowers.length} unfollowers`);
    } catch (error) {
      console.error('[UnfollowTracker] Scan error:', error);
      chrome.runtime.sendMessage({
        type: 'scanError',
        error: error.message,
      });
    } finally {
      this.isScanning = false;
    }
  }

  async getLoggedInUserInfo() {
    // Method 1: Get user ID from cookie and fetch user info
    const userId = this.getLoggedInUserId();

    if (!userId) {
      throw new Error('Not logged in to Instagram');
    }

    console.log(`[UnfollowTracker] Found logged in user ID: ${userId}`);

    try {
      // Use the user ID to get full user info
      const response = await fetch(`https://www.instagram.com/api/v1/users/${userId}/info/`, {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return data.user;
        }
      }
    } catch (e) {
      console.log('[UnfollowTracker] Method 1 failed, trying method 2...');
    }

    // Method 2: Try getting from web_profile_info with username from page data
    try {
      const username = await this.getLoggedInUsername();
      if (username) {
        const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data?.user) {
            return data.data.user;
          }
        }
      }
    } catch (e) {
      console.log('[UnfollowTracker] Method 2 failed');
    }

    return null;
  }

  getLoggedInUserId() {
    // Get user ID from ds_user_id cookie
    const match = document.cookie.match(/ds_user_id=(\d+)/);
    return match ? match[1] : null;
  }

  async getLoggedInUsername() {
    // Try to find username from various sources

    // Method 1: From __meta element in page
    try {
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (data?.require) {
            const str = JSON.stringify(data);
            const match = str.match(/"viewer":\s*\{[^}]*"username":\s*"([^"]+)"/);
            if (match) return match[1];
          }
        } catch (e) {}
      }
    } catch (e) {}

    // Method 2: From profile link in sidebar/navigation
    try {
      // Look for the profile link which usually has the username
      const profileLinks = document.querySelectorAll('a[href^="/"]');
      const userId = this.getLoggedInUserId();

      for (const link of profileLinks) {
        const href = link.getAttribute('href');
        // Profile links are usually /{username}/ format
        if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
          const potentialUsername = href.replace(/\//g, '');
          // Skip common routes
          if (!['explore', 'direct', 'reels', 'stories', 'accounts', 'about'].includes(potentialUsername)) {
            // Verify this is the logged in user by checking if the link leads to a profile
            // This is a heuristic - the profile link is usually in specific locations
            if (link.querySelector('img[alt*="profile"]') || link.closest('[role="navigation"]')) {
              return potentialUsername;
            }
          }
        }
      }
    } catch (e) {}

    // Method 3: Make an API call to get current user
    try {
      const response = await fetch('https://www.instagram.com/api/v1/accounts/current_user/', {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.username) {
          return data.user.username;
        }
      }
    } catch (e) {}

    return null;
  }

  async getFollowers(userId) {
    const followers = [];
    let maxId = null;
    let hasMore = true;

    while (hasMore) {
      try {
        let url = `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=50`;
        if (maxId) {
          url += `&max_id=${maxId}`;
        }

        const response = await fetch(url, {
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.log('[UnfollowTracker] Rate limited, waiting...');
            await this.sleep(5000);
            continue;
          }
          throw new Error(`Failed to fetch followers: ${response.status}`);
        }

        const data = await response.json();

        if (data.users) {
          data.users.forEach((user) => {
            followers.push({
              id: user.pk?.toString() || user.id,
              username: user.username,
              full_name: user.full_name,
              profile_pic_url: user.profile_pic_url,
              is_verified: user.is_verified,
            });
          });
        }

        hasMore = !!data.next_max_id;
        maxId = data.next_max_id;

        this.sendProgress('Fetching followers', followers.length, this.userInfo.follower_count || followers.length);

        await this.sleep(this.config.requestDelay);
      } catch (error) {
        console.error('[UnfollowTracker] Error fetching followers:', error);
        throw error;
      }
    }

    return followers;
  }

  async getFollowing(userId) {
    const following = [];
    let maxId = null;
    let hasMore = true;

    while (hasMore) {
      try {
        let url = `https://www.instagram.com/api/v1/friendships/${userId}/following/?count=50`;
        if (maxId) {
          url += `&max_id=${maxId}`;
        }

        const response = await fetch(url, {
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.log('[UnfollowTracker] Rate limited, waiting...');
            await this.sleep(5000);
            continue;
          }
          throw new Error(`Failed to fetch following: ${response.status}`);
        }

        const data = await response.json();

        if (data.users) {
          data.users.forEach((user) => {
            following.push({
              id: user.pk?.toString() || user.id,
              username: user.username,
              full_name: user.full_name,
              profile_pic_url: user.profile_pic_url,
              is_verified: user.is_verified,
            });
          });
        }

        hasMore = !!data.next_max_id;
        maxId = data.next_max_id;

        this.sendProgress('Fetching following', following.length, this.userInfo.following_count || following.length);

        await this.sleep(this.config.requestDelay);
      } catch (error) {
        console.error('[UnfollowTracker] Error fetching following:', error);
        throw error;
      }
    }

    return following;
  }

  calculateUnfollowers() {
    const followerIds = new Set(this.followers.map((f) => f.id));
    return this.following.filter((f) => !followerIds.has(f.id));
  }

  async unfollowUser(username) {
    try {
      const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Could not get user info');
      }

      const data = await response.json();
      const userId = data.data.user.id;

      const unfollowResponse = await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${userId}/`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
      });

      if (!unfollowResponse.ok) {
        throw new Error('Failed to unfollow');
      }

      console.log(`[UnfollowTracker] Unfollowed @${username}`);
    } catch (error) {
      console.error('[UnfollowTracker] Unfollow error:', error);
    }
  }

  getHeaders() {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

    return {
      'X-CSRFToken': csrfToken,
      'X-IG-App-ID': '936619743392459',
      'X-ASBD-ID': '129477',
      'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2') || '0',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  sendProgress(phase, current, total) {
    chrome.runtime.sendMessage({
      type: 'scanProgress',
      data: { phase, current, total },
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

new InstagramScanner();
