chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes('music.youtube.com/playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["script.js"]
    });
  }else if (details.url.includes('www.youtube.com/playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["script_yt.js"]
    });
  }
}, { url: [{ hostContains: 'youtube.com' }] });

chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.url.includes('music.youtube.com/playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["script.js"]
    });
  }else if (details.url.includes('www.youtube.com/playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["script_yt.js"]
    });
  }
}, { url: [{ hostContains: 'youtube.com' }] });