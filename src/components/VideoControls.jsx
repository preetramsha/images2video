import { useState } from "react";

export default function VideoControls({
  onCreateVideo,
  isProcessing,
  disabled,
}) {
  const [settings, setSettings] = useState({
    duration: 3.0,
    fps: 5,
    format: "mp4",
  });

  const handleCreateVideo = () => {
    onCreateVideo(settings);
  };

  // Don't disable controls if we just don't have FFmpeg loaded yet
  const isDisabled = disabled && isProcessing;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Video Settings</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Duration per image (seconds)
          </label>
          <div className="relative">
            <div className="w-full h-2 bg-white/70 rounded-lg"></div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={settings.duration}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  duration: parseFloat(e.target.value),
                }))
              }
              className="absolute top-0 w-full h-2 bg-transparent rounded-lg cursor-pointer accent-blue-500"
              disabled={isDisabled}
            />
          </div>

          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>0.5s</span>
            <span className="font-medium">{settings.duration}s</span>
            <span>5s</span>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Frame Rate (FPS)
          </label>
          <select
            value={settings.fps}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                fps: parseInt(e.target.value),
              }))
            }
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isDisabled}
          >
            <option value={5}>5 FPS</option>
            <option value={24}>24 FPS</option>
            <option value={30}>30 FPS</option>
            <option value={60}>60 FPS</option>
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Output Format
          </label>
          <select
            value={settings.format}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, format: e.target.value }))
            }
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isDisabled}
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="avi">AVI</option>
          </select>
        </div>

        <button
          onClick={handleCreateVideo}
          disabled={isDisabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            isDisabled
              ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Video...</span>
            </div>
          ) : (
            "🎬 Create Video"
          )}
        </button>

        {disabled && !isProcessing && (
          <p className="text-center text-white/60 text-sm mt-2">
            FFmpeg will load automatically when you create your first video
          </p>
        )}
      </div>
    </div>
  );
}
