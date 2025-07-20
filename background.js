chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes('music.youtube.com/playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["script.js"]
    });
  }
}, { url: [{ hostContains: 'music.youtube.com' }] });