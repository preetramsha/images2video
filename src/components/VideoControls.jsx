import { useState } from "react";

export default function VideoControls({
  onCreateVideo,
  isProcessing,
  disabled,
  hasAudio,
  loading,
  loaded,
}) {
  const [settings, setSettings] = useState({
    duration: 3,
    fps: 5,
    format: "mp4",
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateVideo = () => {
    onCreateVideo(settings);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        ⚙️ Video Settings
      </h3>

      {/* Duration Setting */}
      <div className="space-y-3">
        <label className="block text-white font-medium">
          Duration per Image: {settings.duration}s
        </label>
        <div className="relative">
          <div className="w-full h-2 bg-white/70 rounded-lg"></div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={settings.duration}
            onChange={(e) =>
              handleSettingChange("duration", parseFloat(e.target.value))
            }
            className="absolute top-0 w-full h-2 bg-transparent rounded-lg cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex justify-between text-xs text-white/60">
          <span>0.5s</span>
          <span>10s</span>
        </div>
      </div>

      {/* FPS Setting */}
      <div className="space-y-3">
        <label className="block text-white font-medium">
          Frame Rate: {settings.fps} FPS
        </label>
        <select
          value={settings.fps}
          onChange={(e) => handleSettingChange("fps", parseInt(e.target.value))}
          className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option selected value={5}>
            5 FPS (Recommended & Fastest)
          </option>
          <option value={24}>24 FPS (Cinematic)</option>
          <option value={24}>24 FPS (Cinematic)</option>
          <option value={30}>30 FPS (Standard)</option>
          <option value={60}>60 FPS (Smooth)</option>
        </select>
      </div>

      {/* Format Setting */}
      <div className="space-y-3">
        <label className="block text-white font-medium">Output Format</label>
        <select
          value={settings.format}
          onChange={(e) => handleSettingChange("format", e.target.value)}
          className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="avi">AVI</option>
        </select>
      </div>

      {/* Audio Status */}
      {hasAudio && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Audio track will be included</span>
          </div>
          <p className="text-xs text-green-300/80 mt-1">
            Audio will be trimmed to match video duration
          </p>
        </div>
      )}

      {/* Create Video Button */}
      <button
        onClick={handleCreateVideo}
        disabled={disabled || isProcessing || loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform ${
          disabled || isProcessing || loading
            ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105 shadow-lg"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Loading Engine...</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "🎬 Create Video"
        )}
      </button>

      {/* Video Preview Info */}
      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <h4 className="text-white font-medium text-sm">Preview Settings:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
          <div>Duration per image: {settings.duration}s</div>
          <div>Frame rate: {settings.fps} FPS</div>
          <div>Output format: {settings.format.toUpperCase()}</div>
          <div>Audio: {hasAudio ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
}
