import React from 'react';

const VideoPlayer = ({ url, title }) => {
  if (!url) return null;

  // Check if it's a YouTube URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Check if it's a Vimeo URL
  const getVimeoVideoId = (url) => {
    const regExp = /^.*(vimeo\.com\/)(?:.*#|.*\/videos\/|.*\/|channels\/.*\/|groups\/.*\/videos\/|album\/.*\/video\/|video\/)?([0-9]+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  };

  const youtubeId = getYouTubeVideoId(url);
  const vimeoId = getVimeoVideoId(url);

  if (youtubeId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "YouTube video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || "Vimeo video"}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    );
  }

  // For direct video URLs or other embeddable content
  if (url.includes('embed') || url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          <video
            controls
            className="w-full h-full"
            preload="metadata"
          >
            <source src={url} type={`video/${url.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      // Assume it's an embeddable iframe
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={url}
            title={title || "Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      );
    }
  }

  // Fallback: show as link if not recognized
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
      Watch Video
    </a>
  );
};

export default VideoPlayer;