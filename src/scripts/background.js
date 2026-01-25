/**
 * UnfollowTracker - Background Service Worker
 * Handles extension lifecycle and message routing
 */

// Extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[UnfollowTracker] Extension installed');

    // Set default storage values
    chrome.storage.local.set({
      settings: {
        autoScan: false,
        scanInterval: 24, // hours
        notifications: true,
        whitelist: [],
      },
      lastScan: null,
      followers: [],
      following: [],
      unfollowers: [],
    });
  } else if (details.reason === 'update') {
    console.log('[UnfollowTracker] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Message routing between popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward messages from content script to popup
  if (sender.tab) {
    // Message from content script - forward to popup
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might be closed, ignore error
    });
  }

  return true;
});

// Handle extension icon click when popup is disabled
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on Instagram
  if (tab.url && tab.url.includes('instagram.com')) {
    // Inject content script if not already injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/scripts/content.js'],
      });
    } catch (error) {
      console.log('[UnfollowTracker] Content script already injected or error:', error);
    }
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'unfollowtracker-scan',
    title: 'Scan for unfollowers',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.instagram.com/*'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'unfollowtracker-scan') {
    chrome.tabs.sendMessage(tab.id, { action: 'startScan' });
  }
});

// Alarm for periodic scans (if enabled)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodic-scan') {
    const { settings } = await chrome.storage.local.get('settings');

    if (settings && settings.autoScan) {
      // Find Instagram tab and trigger scan
      const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });

      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startScan' });
      }
    }
  }
});

// Setup periodic scan alarm
async function setupPeriodicScan() {
  const { settings } = await chrome.storage.local.get('settings');

  if (settings && settings.autoScan) {
    chrome.alarms.create('periodic-scan', {
      periodInMinutes: settings.scanInterval * 60,
    });
  } else {
    chrome.alarms.clear('periodic-scan');
  }
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.settings) {
    setupPeriodicScan();
  }
});

console.log('[UnfollowTracker] Background service worker started');
