import { useRef } from "react";

export default function AudioUploader({
  audioFile,
  onAudioSelected,
  onRemoveAudio,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith("audio/")) {
      onAudioSelected(file);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("audio/")) {
      onAudioSelected(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (audioFile) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🎵 Audio Track</h3>
          <button
            onClick={onRemoveAudio}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Remove audio"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎵</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {audioFile.name}
              </p>
              <p className="text-white/60 text-sm">
                {formatFileSize(audioFile.size)}
              </p>
            </div>
          </div>

          <audio
            src={audioFile.url}
            controls
            className="w-full mt-3"
            style={{ height: "40px" }}
          />
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleClick}
            className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
          >
            Replace Audio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center cursor-pointer hover:border-white/50 transition-all duration-300 hover:bg-white/5"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="text-white/80 space-y-3">
        <div className="text-3xl">🎵</div>
        <h3 className="text-lg font-semibold">Add Background Audio</h3>
        <p className="text-white/60 text-sm">
          Click here or drag and drop an audio file (optional)
        </p>
        <p className="text-xs text-white/50">
          Supports MP3, WAV, AAC, OGG and other audio formats
        </p>
        <p className="text-xs text-yellow-400/80">
          Note: Audio will be trimmed to match video duration
        </p>
      </div>
    </div>
  );
}
