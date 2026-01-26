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
        scanInterval: 24,
        notifications: true,
        whitelist: [],
      },
      lastScan: null,
      followers: [],
      following: [],
      unfollowers: [],
    });
  }
});

// Message routing between popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.tab) {
    chrome.runtime.sendMessage(message).catch(() => {});
  }
  return true;
});

console.log('[UnfollowTracker] Background service worker started');
