import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    if (loaded) return;
    setLoading(true);

    const ffmpeg = ffmpegRef.current;

    // Set up progress handler
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

      // Load FFmpeg with the required core files
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      setLoaded(true);
    } catch (err) {
      console.error("FFmpeg load failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (images, settings) => {
    if (!loaded) throw new Error("FFmpeg not loaded");
    const ffmpeg = ffmpegRef.current;
    setProgress(0);

    try {
      // Write each image into the FFmpeg FS
      for (let i = 0; i < images.length; i++) {
        const name = `img${String(i).padStart(3, "0")}.png`;
        const data = await fetchFile(images[i].url);
        await ffmpeg.writeFile(name, data);
      }

      // Build the concat list
      const list =
        images
          .map(
            (_, i) =>
              `file img${String(i).padStart(3, "0")}.png\nduration ${
                settings.duration
              }`
          )
          .join("\n") + "\n";
      await ffmpeg.writeFile("list.txt", list);

      // Run FFmpeg
      const outName = `out.${settings.format}`;
      await ffmpeg.exec([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "list.txt",
        "-vf",
        "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
        "-r",
        String(settings.fps),
        "-pix_fmt",
        "yuv420p",
        "-y",
        outName,
      ]);

      // Read back the video data
      const outputData = await ffmpeg.readFile(outName);

      // Clean up all files
      for (let i = 0; i < images.length; i++) {
        await ffmpeg.deleteFile(`img${String(i).padStart(3, "0")}.png`);
      }
      await ffmpeg.deleteFile("list.txt");
      await ffmpeg.deleteFile(outName);

      return new Blob([outputData.buffer], {
        type: `video/${settings.format}`,
      });
    } catch (err) {
      console.error("Video creation failed:", err);
      throw err;
    }
  };

  return { loaded, loading, progress, load, createVideo };
}
