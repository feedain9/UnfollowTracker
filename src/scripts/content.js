/**
 * UnfollowTracker - Content Script
 * Injected into Instagram pages to scan followers/following
 * Based on: https://github.com/davidarroyo1234/InstagramUnfollowers
 */

class InstagramScanner {
  constructor() {
    this.followers = [];
    this.following = [];
    this.unfollowers = [];
    this.isScanning = false;
    this.userInfo = null;

    // Rate limiting config
    this.config = {
      requestDelay: 1000, // Delay between API requests (ms)
      scrollDelay: 500,
      maxRetries: 3,
    };

    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep channel open for async response
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
      // Get current user info
      this.userInfo = await this.getCurrentUserInfo();

      if (!this.userInfo) {
        throw new Error('Could not get user info. Make sure you\'re logged in.');
      }

      console.log(`[UnfollowTracker] Starting scan for @${this.userInfo.username}`);

      // Get followers
      this.sendProgress('Fetching followers', 0, this.userInfo.follower_count);
      this.followers = await this.getFollowers(this.userInfo.id);

      // Get following
      this.sendProgress('Fetching following', 0, this.userInfo.following_count);
      this.following = await this.getFollowing(this.userInfo.id);

      // Calculate unfollowers (people you follow who don't follow you back)
      this.unfollowers = this.calculateUnfollowers();

      // Send results to popup
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

  async getCurrentUserInfo() {
    try {
      // Try to get user ID from the page
      const response = await fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username=' + this.getLoggedInUsername(), {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      console.error('[UnfollowTracker] Error getting user info:', error);
      return null;
    }
  }

  getLoggedInUsername() {
    // Try multiple methods to get the logged-in username

    // Method 1: From meta tag
    const metaTag = document.querySelector('meta[property="al:ios:url"]');
    if (metaTag) {
      const match = metaTag.content.match(/user\?username=([^&]+)/);
      if (match) return match[1];
    }

    // Method 2: From localStorage
    try {
      const ds_user_id = document.cookie.match(/ds_user_id=(\d+)/);
      if (ds_user_id) {
        // Get username from session storage or another source
        const sessionData = sessionStorage.getItem('www-claim-v2');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          if (parsed.username) return parsed.username;
        }
      }
    } catch (e) {}

    // Method 3: From profile link in navigation
    const profileLink = document.querySelector('a[href*="/"][role="link"] span');
    if (profileLink && profileLink.textContent) {
      return profileLink.textContent;
    }

    // Method 4: Parse from URL if on own profile
    const match = window.location.pathname.match(/^\/([^/]+)\/?$/);
    if (match && match[1] !== 'explore' && match[1] !== 'direct' && match[1] !== 'reels') {
      return match[1];
    }

    throw new Error('Could not determine logged in username');
  }

  async getFollowers(userId) {
    const followers = [];
    let endCursor = null;
    let hasNext = true;

    while (hasNext) {
      try {
        const variables = {
          id: userId,
          include_reel: false,
          fetch_mutual: false,
          first: 50,
        };

        if (endCursor) {
          variables.after = endCursor;
        }

        const url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=${encodeURIComponent(JSON.stringify(variables))}`;

        const response = await fetch(url, {
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait and retry
            await this.sleep(5000);
            continue;
          }
          throw new Error(`Failed to fetch followers: ${response.status}`);
        }

        const data = await response.json();
        const edge = data.data?.user?.edge_followed_by;

        if (!edge) {
          throw new Error('Invalid response structure');
        }

        edge.edges.forEach((e) => {
          followers.push({
            id: e.node.id,
            username: e.node.username,
            full_name: e.node.full_name,
            profile_pic_url: e.node.profile_pic_url,
            is_verified: e.node.is_verified,
          });
        });

        hasNext = edge.page_info.has_next_page;
        endCursor = edge.page_info.end_cursor;

        this.sendProgress('Fetching followers', followers.length, this.userInfo.follower_count);

        // Rate limiting delay
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
    let endCursor = null;
    let hasNext = true;

    while (hasNext) {
      try {
        const variables = {
          id: userId,
          include_reel: false,
          fetch_mutual: false,
          first: 50,
        };

        if (endCursor) {
          variables.after = endCursor;
        }

        const url = `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=${encodeURIComponent(JSON.stringify(variables))}`;

        const response = await fetch(url, {
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            await this.sleep(5000);
            continue;
          }
          throw new Error(`Failed to fetch following: ${response.status}`);
        }

        const data = await response.json();
        const edge = data.data?.user?.edge_follow;

        if (!edge) {
          throw new Error('Invalid response structure');
        }

        edge.edges.forEach((e) => {
          following.push({
            id: e.node.id,
            username: e.node.username,
            full_name: e.node.full_name,
            profile_pic_url: e.node.profile_pic_url,
            is_verified: e.node.is_verified,
          });
        });

        hasNext = edge.page_info.has_next_page;
        endCursor = edge.page_info.end_cursor;

        this.sendProgress('Fetching following', following.length, this.userInfo.following_count);

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

    // Unfollowers = people you follow who don't follow you back
    return this.following.filter((f) => !followerIds.has(f.id));
  }

  async unfollowUser(username) {
    try {
      // Get user ID first
      const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Could not get user info');
      }

      const data = await response.json();
      const userId = data.data.user.id;

      // Unfollow
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
    // Get CSRF token from cookies
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

// Initialize scanner
new InstagramScanner();
