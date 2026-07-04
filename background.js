function injectForPlaylist(details) {
  const url = new URL(details.url);
  const isMusicPlaylist = url.hostname === 'music.youtube.com' && url.pathname === '/playlist';
  const isYouTubePlaylist = /(^|\.)youtube\.com$/i.test(url.hostname) && url.pathname === '/playlist';

  if (!isMusicPlaylist && !isYouTubePlaylist) return;

  const scriptFile = isMusicPlaylist ? 'script.js' : 'script_yt.js';

  chrome.scripting.executeScript({
    target: { tabId: details.tabId },
    files: [scriptFile]
  });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(injectForPlaylist, {
  url: [{ hostContains: 'youtube.com' }]
});

chrome.webNavigation.onCompleted.addListener(injectForPlaylist, {
  url: [{ hostContains: 'youtube.com' }]
});