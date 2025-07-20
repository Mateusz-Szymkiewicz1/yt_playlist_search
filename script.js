(() => {
  let style = document.createElement('style')
  style.innerHTML = '.search_result:hover{background: red;}'
  let container = document.createElement('div');
  container.style.cssText = 'box-sizing: border-box;width: 90%;margin-top: 80px;margin-bottom:-30px;margin-left:15px;position: relative;';

  let search = document.createElement("input");
  search.placeholder = "Loading songs...";
  search.disabled = true;
  search.className = "playlist_search"
  search.style.cssText = "box-sizing: border-box;width: 100%;background:#505050;border:0;outline:none;color:#eee;font-size:16px;padding:10px;border-radius: 10px;";
  container.appendChild(search);

  let resultsContainer = document.createElement('div');
  resultsContainer.style.cssText = "box-sizing: border-box;width: 100%; background: #404040; color: #eee; margin-top: 5px; max-height: 300px; overflow-y: auto; border-radius: 5px; font-size: 14px;";
  container.appendChild(resultsContainer);

  document.querySelector('#secondary').prepend(container);
  document.querySelector('#secondary').prepend(style);
  document.addEventListener('click', () => {
    if(event.target.className == "search_result" || event.target.className == "playlist_search") return
    resultsContainer.innerHTML = ''
  })
  search.addEventListener('input', () => {
    resultsContainer.innerHTML = ''; // Clear previous results
    if (search.value.length < 3) return;

    if (window.videos && window.videos.length > 0) {
      let results = window.videos.filter(x =>
        x.title.toLowerCase().includes(search.value.toLowerCase()) ||
        x.channel.toLowerCase().includes(search.value.toLowerCase())
      );

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 10px;">No results found.</div>';
      } else {
        results.forEach(item => {
          let div = document.createElement('a');
          div.href="https://music.youtube.com/watch?v="+item.id
          div.textContent = `${item.channel} — ${item.title}`;
          div.target = "blank"
          div.className = "search_result"
          div.style.cssText = "cursor:pointer;display: block;color:#eee;text-decoration:none;padding: 10px; border-bottom: 1px solid #555;";
          resultsContainer.appendChild(div);
        });
      }
    }
  });

  let playlist = window.location.search.split("=")[1];
  let api_key = "AIzaSyD-2VsB6HLBe9m2ZSXmQbGR1b2gzFNijLQ";

  async function getPlaylistItems(playlistId, apiKey) {
    let nextPageToken = '';
    const allItems = [];

    do {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`);
      const data = await response.json();

      if (data.items) {
        allItems.push(...data.items);
      }

      nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);

    return allItems;
  }

  getPlaylistItems(playlist, api_key)
    .then(items => {
      const videos = items.map(item => ({
        title: item.snippet.title,
        channel: item.snippet.videoOwnerChannelTitle,
        id: item.snippet.resourceId.videoId
      })).filter(x => x.title && x.channel);
      window.videos = videos;
      console.log(videos);
      search.placeholder = "Search in this playlist...";
      search.disabled = false;
    })
    .catch(err => console.error('Error fetching playlist:', err));
})();
