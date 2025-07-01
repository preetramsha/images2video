import { useState, useCallback, useEffect } from "react";
import ImageUploader from "./components/ImageUploader";
import ImageList from "./components/ImageList";
import VideoControls from "./components/VideoControls";
import AudioUploader from "./components/AudioUploader";
import useFFmpeg from "./hooks/useFFmpeg";

let imageIdCounter = 0;

function App() {
  const [images, setImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  const { loaded, loading, progress, load, createVideo } = useFFmpeg();

  useEffect(() => {
    if (localStorage.getItem("dont-show-modal") == "true") {
      return;
    }
    const timer = setTimeout(() => setShowAdModal(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleImagesSelected = useCallback((files) => {
    const newImages = files.map((file) => ({
      id: `image_${++imageIdCounter}`,
      name: file.name,
      size: file.size,
      file: file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setError(null);
  }, []);

  const handleAudioSelected = useCallback(
    (file) => {
      if (audioFile) {
        URL.revokeObjectURL(audioFile.url);
      }

      const audioData = {
        name: file.name,
        size: file.size,
        file: file,
        url: URL.createObjectURL(file),
      };

      setAudioFile(audioData);
      setError(null);
    },
    [audioFile]
  );

  const handleRemoveAudio = useCallback(() => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.url);
      setAudioFile(null);
    }
  }, [audioFile]);

  const handleReorder = useCallback((reorderedImages) => {
    setImages(reorderedImages);
  }, []);

  const handleRemove = useCallback((imageId) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      const removedImage = prev.find((img) => img.id === imageId);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.url);
      }
      return updated;
    });
  }, []);

  const handleCreateVideo = async (settings) => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (!loaded) {
        console.log("FFmpeg not loaded, loading now...");
        await load();
      }

      if (!loaded) {
        await load();
        throw new Error("Failed to load FFmpeg engine");
      }

      const videoBlob = await createVideo(images, settings, audioFile);
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } catch (err) {
      console.error("Error creating video:", err);
      setError(err.message || "Failed to create video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `${crypto.randomUUID().split("-")[0]}-slideshow.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (audioFile) URL.revokeObjectURL(audioFile.url);

    setImages([]);
    setAudioFile(null);
    setVideoUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎬 Image to Video Creator
          </h1>
          <p className="text-white/80 text-lg">
            Upload images and audio, reorder them, and create a beautiful video
            slideshow
          </p>
        </div>

        {loading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-white mb-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-xl font-semibold">Loading Video Engine...</h3>
              <p className="text-white/60 mt-2">
                Preparing FFmpeg WebAssembly (this may take a moment)
              </p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center text-white mb-4">
              <div className="text-2xl mb-2">🎬</div>
              <h3 className="text-xl font-semibold">Creating Your Video</h3>
              <p className="text-white/60 mt-2">
                Processing {images.length} images
                {audioFile ? " with audio" : ""}...
              </p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-white/80 mt-2">{progress}%</p>
          </div>
        )}

        {videoUrl && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                🎉 Video Created Successfully!
              </h3>
            </div>
            <video
              src={videoUrl}
              controls
              className="w-72 max-w-2xl mx-auto rounded-lg shadow-lg"
            />
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📥 Download Video
              </button>
              <button
                onClick={handleReset}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        )}

        {!videoUrl && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ImageUploader onImagesSelected={handleImagesSelected} />
              <AudioUploader
                audioFile={audioFile}
                onAudioSelected={handleAudioSelected}
                onRemoveAudio={handleRemoveAudio}
              />
              <ImageList
                images={images}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />
            </div>
            <div>
              <VideoControls
                onCreateVideo={handleCreateVideo}
                isProcessing={isProcessing}
                loading={loading}
                loaded={loaded}
                disabled={images.length === 0}
                hasAudio={!!audioFile}
              />
            </div>
          </div>
        )}

        {images.length === 0 && !videoUrl && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              How to Use
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-white">
              <div className="space-y-2">
                <div className="text-2xl">1️⃣</div>
                <h4 className="font-semibold">Upload Images</h4>
                <p className="text-sm">Click or drag images to upload them</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">2️⃣</div>
                <h4 className="font-semibold">Add Audio</h4>
                <p className="text-sm">Optional: Upload background music</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">3️⃣</div>
                <h4 className="font-semibold">Reorder</h4>
                <p className="text-sm">Drag images to change their sequence</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">4️⃣</div>
                <h4 className="font-semibold">Create Video</h4>
                <p className="text-sm">Adjust settings and create your video</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ViralBatch Footer CTA */}
      <div className="mt-16">
        <div className="text-center text-white text-sm space-y-2">
          <p>
            🚀 Want to go viral faster? Use{" "}
            <a
              href="https://viralbatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline hover:text-purple-300"
            >
              ViralBatch.com
            </a>{" "}
            to generate dozens of <strong>VIRAL</strong> videos in minutes!
          </p>
          <p className="text-white/70">
            🔒 Your privacy is protected — everything runs locally in your
            browser. Nothing gets uploaded to the cloud.
          </p>
          <p className="opacity-70">
            Created with ❤️ by Preet Jariwala - @preetramsha
          </p>
        </div>
      </div>

      {/* ViralBatch Modal Ad */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto relative text-center shadow-2xl">
            <button
              onClick={() => setShowAdModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-black">
              🚀 Want to Make 100s of Videos Instantly?
            </h2>
            <p className="text-gray-700 mb-4 text-sm">
              Try <strong>ViralBatch</strong> — the AI tool that turns your
              hooks, audio & clips into dozens of short-form videos!
            </p>
            <p className="text-gray-700 mb-4 text-sm">
              Go <strong>Viral</strong> easily and boost your accounts
              effortlessly.
            </p>
            <a
              href="https://viralbatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Try ViralBatch Free →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
