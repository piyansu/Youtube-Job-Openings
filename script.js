const apiKey = "AIzaSyDmV9RR8w4zgPU_NXmTgOAtHcPimh9ASmw";
const channels = [
  { id: "UCNTw5al-WwENuiTQjFT-Twg", name: "KN ACADEMY" },
  { id: "UCHoryD8Gefwa-1fKhPzBchg", name: "The Humble Coder" },
  { id: "UCcyogDO_BD5HS7YlySkTELQ", name: "Online Learning" },
];

async function fetchVideos(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items || []; // Handle empty results
}

async function fetchVideoDetails(videoIds) {
    if (videoIds.length === 0) return [];
    
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(",")}&part=contentDetails`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.items || [];
}

function isLongVideo(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match[1] ? parseInt(match[1]) * 3600 : 0;
    const minutes = match[2] ? parseInt(match[2]) * 60 : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    return (hours + minutes + seconds) > 60; // Only include videos longer than 1 minute
}

async function loadVideos() {
    const videoContainer = document.getElementById("videoContainer");
    videoContainer.innerHTML = "";

    for (let channel of channels) {
        const videos = await fetchVideos(channel.id);
        const videoIds = videos.map(video => video.id.videoId).filter(id => id);

        const videoDetails = await fetchVideoDetails(videoIds);

        // Filter only long videos and take the last 4 uploaded
        const longVideos = videoDetails
            .filter(video => isLongVideo(video.contentDetails.duration))
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

            longVideos.forEach(video => {
                const videoId = video.id;
                const videoData = videos.find(v => v.id.videoId === videoId).snippet;
                const title = videoData.title;
                const thumbnail = videoData.thumbnails.medium.url;
                
                const videoElement = document.createElement("div");
                videoElement.className = "video";
                videoElement.innerHTML = `
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                        <img src="${thumbnail}" alt="${title}">
                    </a>
                    <p><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">${title}</a></p>
                `;
                videoRow.appendChild(videoElement);
            });
        }
    }
}

// Load videos when the page loads
window.onload = loadVideos;
c
