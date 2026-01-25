/**
 * UnfollowTracker - Popup Script
 * Handles the extension popup UI and communication with content script
 */

class UnfollowTrackerPopup {
  constructor() {
    this.elements = {
      statusBar: document.getElementById('statusBar'),
      statusIndicator: document.querySelector('.status-indicator'),
      statusText: document.querySelector('.status-text'),
      followersCount: document.getElementById('followersCount'),
      followingCount: document.getElementById('followingCount'),
      unfollowersCount: document.getElementById('unfollowersCount'),
      scanBtn: document.getElementById('scanBtn'),
      progressSection: document.getElementById('progressSection'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      resultsSection: document.getElementById('resultsSection'),
      resultsList: document.getElementById('resultsList'),
      exportBtn: document.getElementById('exportBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
    };

    this.isScanning = false;
    this.results = [];

    this.init();
  }

  async init() {
    // Check if we're on Instagram
    await this.checkInstagramTab();

    // Load cached data
    await this.loadCachedData();

    // Setup event listeners
    this.setupEventListeners();

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
    });
  }

  async checkInstagramTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.url && tab.url.includes('instagram.com')) {
        this.setStatus('online', 'Connected to Instagram');
        this.elements.scanBtn.disabled = false;
      } else {
        this.setStatus('offline', 'Open Instagram to start');
        this.elements.scanBtn.disabled = true;
      }
    } catch (error) {
      console.error('Error checking tab:', error);
      this.setStatus('offline', 'Unable to detect page');
    }
  }

  async loadCachedData() {
    try {
      const data = await chrome.storage.local.get(['followers', 'following', 'unfollowers', 'lastScan']);

      if (data.followers) {
        this.elements.followersCount.textContent = this.formatNumber(data.followers.length);
      }

      if (data.following) {
        this.elements.followingCount.textContent = this.formatNumber(data.following.length);
      }

      if (data.unfollowers && data.unfollowers.length > 0) {
        this.elements.unfollowersCount.textContent = this.formatNumber(data.unfollowers.length);
        this.results = data.unfollowers;
        this.showResults(data.unfollowers);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  setupEventListeners() {
    this.elements.scanBtn.addEventListener('click', () => this.startScan());
    this.elements.exportBtn.addEventListener('click', () => this.exportResults());
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
  }

  async startScan() {
    if (this.isScanning) return;

    this.isScanning = true;
    this.setStatus('scanning', 'Scanning in progress...');
    this.elements.scanBtn.disabled = true;
    this.elements.scanBtn.innerHTML = '<div class="spinner"></div><span>Scanning...</span>';

    // Show progress section
    this.elements.progressSection.classList.remove('hidden');
    this.elements.resultsSection.classList.add('hidden');

    try {
      // Send message to content script to start scanning
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.tabs.sendMessage(tab.id, { action: 'startScan' });
    } catch (error) {
      console.error('Error starting scan:', error);
      this.showError('Failed to start scan. Make sure you\'re on Instagram.');
      this.resetScanButton();
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'scanProgress':
        this.updateProgress(message.data);
        break;

      case 'scanComplete':
        this.handleScanComplete(message.data);
        break;

      case 'scanError':
        this.showError(message.error);
        this.resetScanButton();
        break;

      case 'statsUpdate':
        this.updateStats(message.data);
        break;
    }
  }

  updateProgress(data) {
    const { phase, current, total } = data;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    this.elements.progressFill.style.width = `${percentage}%`;
    this.elements.progressText.textContent = `${phase}: ${current} / ${total}`;
  }

  handleScanComplete(data) {
    const { followers, following, unfollowers } = data;

    // Update stats
    this.elements.followersCount.textContent = this.formatNumber(followers.length);
    this.elements.followingCount.textContent = this.formatNumber(following.length);
    this.elements.unfollowersCount.textContent = this.formatNumber(unfollowers.length);

    // Save to storage
    chrome.storage.local.set({
      followers,
      following,
      unfollowers,
      lastScan: Date.now(),
    });

    // Show results
    this.results = unfollowers;
    this.showResults(unfollowers);

    // Reset UI
    this.resetScanButton();
    this.setStatus('online', 'Scan complete');
    this.elements.progressSection.classList.add('hidden');
  }

  showResults(unfollowers) {
    this.elements.resultsSection.classList.remove('hidden');
    this.elements.resultsList.innerHTML = '';

    if (unfollowers.length === 0) {
      this.elements.resultsList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <p>Everyone you follow follows you back!</p>
        </div>
      `;
      return;
    }

    unfollowers.slice(0, 50).forEach((user) => {
      const userElement = this.createUserElement(user);
      this.elements.resultsList.appendChild(userElement);
    });

    if (unfollowers.length > 50) {
      const moreElement = document.createElement('div');
      moreElement.className = 'empty-state';
      moreElement.innerHTML = `<p>And ${unfollowers.length - 50} more...</p>`;
      this.elements.resultsList.appendChild(moreElement);
    }
  }

  createUserElement(user) {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `
      <img
        class="user-avatar"
        src="${user.profile_pic_url || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\' fill=\'%23333\'/%3E%3C/svg%3E'}"
        alt="${user.username}"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'%3E%3Ccircle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23333\\'/%3E%3C/svg%3E'"
      />
      <div class="user-info">
        <span class="user-name">${user.full_name || user.username}</span>
        <span class="user-handle">@${user.username}</span>
      </div>
      <button class="btn-unfollow" data-username="${user.username}">Unfollow</button>
    `;

    // Add click handler for profile
    div.querySelector('.user-info').addEventListener('click', () => {
      chrome.tabs.create({ url: `https://www.instagram.com/${user.username}/` });
    });

    // Add unfollow handler
    div.querySelector('.btn-unfollow').addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.unfollowUser(user.username, div);
    });

    return div;
  }

  async unfollowUser(username, element) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'unfollow', username });

      element.style.opacity = '0.5';
      element.querySelector('.btn-unfollow').textContent = 'Unfollowed';
      element.querySelector('.btn-unfollow').disabled = true;
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  }

  exportResults() {
    if (this.results.length === 0) return;

    const data = {
      exportDate: new Date().toISOString(),
      unfollowersCount: this.results.length,
      unfollowers: this.results.map((u) => ({
        username: u.username,
        fullName: u.full_name,
        profileUrl: `https://www.instagram.com/${u.username}/`,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `unfollowers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  openSettings() {
    // TODO: Implement settings panel
    this.showToast('Settings coming soon!');
  }

  setStatus(type, text) {
    this.elements.statusIndicator.className = `status-indicator ${type}`;
    this.elements.statusText.textContent = text;
  }

  resetScanButton() {
    this.isScanning = false;
    this.elements.scanBtn.disabled = false;
    this.elements.scanBtn.innerHTML = `
      <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <span>Scan my account</span>
    `;
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  updateStats(data) {
    if (data.followers !== undefined) {
      this.elements.followersCount.textContent = this.formatNumber(data.followers);
    }
    if (data.following !== undefined) {
      this.elements.followingCount.textContent = this.formatNumber(data.following);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UnfollowTrackerPopup();
});
