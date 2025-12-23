const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

function _formatVideo(item) {
  if (!item) return null;
  const vid = item.id && item.id.videoId ? item.id.videoId : item.id;
  const snip = item.snippet || {};
  const thumbnail = snip.thumbnails && (snip.thumbnails.high || snip.thumbnails.default);
  return {
    videoId: vid,
    title: snip.title || '',
    thumbnail: thumbnail ? thumbnail.url : null,
    url: vid ? `https://www.youtube.com/watch?v=${vid}` : null,
    embedUrl: vid ? `https://www.youtube.com/embed/${vid}` : null
  };
}

async function searchTrailer(movieTitle, year) {
  if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not set');
  const query = `${movieTitle} ${year || ''} trailer`.trim();
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const response = await axios.get(url, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 1,
      key: YOUTUBE_API_KEY
    }
  });
  if (!response.data.items || response.data.items.length === 0) return null;
  return _formatVideo(response.data.items[0]);
}

async function getVideoDetails(videoId) {
  if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not set');
  const url = 'https://www.googleapis.com/youtube/v3/videos';
  const response = await axios.get(url, {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY
    }
  });
  if (!response.data.items || response.data.items.length === 0) return null;
  return _formatVideo(response.data.items[0]);
}

module.exports = {
  searchTrailer,
  getVideoDetails
};
