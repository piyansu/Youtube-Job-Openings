const apiKey = "AIzaSyCo_8-wGMCV4dMaWbyMq_MqVt0ARmM50BM";
const channels = [
  { id: "UCNTw5al-WwENuiTQjFT-Twg", name: "KN ACADEMY" },
  { id: "UCHoryD8Gefwa-1fKhPzBchg", name: "The Humble Coder" },
  { id: "UCcyogDO_BD5HS7YlySkTELQ", name: "Online Learning" },
  { id: "UCGFNZxMqKLsqWERX_N2f08Q", name: "Last moment tuitions" },
];

async function fetchVideos(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items || []; // Handle empty results
}

async function fetchVideoDetails(videoIds) {
  if (videoIds.length === 0) return [];

  const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(
    ","
  )}&part=contentDetails,snippet`;
  const response = await fetch(url);
  const data = await response.json();

  return data.items || [];
}

function isLongVideo(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) * 3600 : 0;
  const minutes = match[2] ? parseInt(match[2]) * 60 : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours + minutes + seconds > 100; // Only include videos longer than 1 minute
}

// Convert ISO Date to "Time Ago" format
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

async function loadVideos() {
  const videoContainer = document.getElementById("videoContainer");
  videoContainer.innerHTML = "";

  for (let channel of channels) {
    const videos = await fetchVideos(channel.id);
    const videoIds = videos.map((video) => video.id.videoId).filter((id) => id);

    const videoDetails = await fetchVideoDetails(videoIds);

    // Filter only long videos and take the last 4 uploaded
    const longVideos = videoDetails
      .filter((video) => isLongVideo(video.contentDetails.duration))
      .slice(0, 4); // Get only last 4 videos

    if (longVideos.length > 0) {
      // Create section for the channel
      const channelSection = document.createElement("div");
      channelSection.className = "channel-section";
      channelSection.innerHTML = `<h2>${channel.name}</h2>`;
      videoContainer.appendChild(channelSection);

      const videoRow = document.createElement("div");
      videoRow.className = "video-row";
      channelSection.appendChild(videoRow);

      longVideos.forEach((video) => {
        const videoId = video.id;
        const videoData = videos.find((v) => v.id.videoId === videoId).snippet;
        const title = videoData.title;
        const thumbnail = videoData.thumbnails.medium.url;
        const publishedAt = timeAgo(videoData.publishedAt); // Convert to time ago

        const videoElement = document.createElement("div");
        videoElement.className = "video";
        videoElement.innerHTML = `
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                        <img src="${thumbnail}" alt="${title}">
                    </a>
                    <p><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">${title}</a></p>
                    <p style="font-size: 12px; color: #bbb;">${publishedAt}</p> <!-- Time Ago -->
                `;
        videoRow.appendChild(videoElement);
      });
    }
  }
}

// Load videos when the page loads
window.onload = loadVideos;
