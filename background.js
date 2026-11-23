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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'fetchPlaylistItems') return false;

  fetchPlaylistItems(message.playlistId)
    .then((items) => sendResponse({ ok: true, items }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

const playlistCache = new Map();
const playlistRequests = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchPlaylistItems(playlistId) {
  const cached = playlistCache.get(playlistId);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.items;
  }

  const storageKey = `playlist:${playlistId}`;
  const stored = await chrome.storage.local.get(storageKey);
  const storedCache = stored[storageKey];

  if (storedCache && Date.now() - storedCache.createdAt < CACHE_TTL_MS) {
    playlistCache.set(playlistId, storedCache);
    return storedCache.items;
  }

  const pending = playlistRequests.get(playlistId);
  if (pending) return pending;

  const request = fetchPlaylistPages(playlistId);
  playlistRequests.set(playlistId, request);

  try {
    return await request;
  } finally {
    playlistRequests.delete(playlistId);
  }
}

async function fetchPlaylistPages(playlistId) {
  const apiKey = 'AIzaSyD-2VsB6HLBe9m2ZSXmQbGR1b2gzFNijLQ';
  const allItems = [];
  let nextPageToken = '';

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      fields: 'nextPageToken,items(snippet(title,videoOwnerChannelTitle,resourceId/videoId))',
      maxResults: '50',
      playlistId,
      key: apiKey,
      pageToken: nextPageToken
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `YouTube API request failed (${response.status})`);
    }
    if (data.items) allItems.push(...data.items);
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  playlistCache.set(playlistId, { items: allItems, createdAt: Date.now() });
  await chrome.storage.local.set({
    [`playlist:${playlistId}`]: { items: allItems, createdAt: Date.now() }
  });
  return allItems;
}