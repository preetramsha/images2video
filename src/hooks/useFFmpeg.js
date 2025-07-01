import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());
  const loadPromiseRef = useRef(null);

  useEffect(() => {
    load().catch((err) => {
      console.error("FFmpeg initial load failed", err);
    });
  }, []);

  const load = async () => {
    if (loaded) return;
    if (loadPromiseRef.current) return loadPromiseRef.current;

    const loadPromise = (async () => {
      setLoading(true);
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

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

        if (!ffmpeg.loaded) {
          throw new Error("FFmpeg load verification failed");
        }

        setLoaded(true);
      } catch (err) {
        console.error("FFmpeg load failed:", err);
        setLoaded(false);
        throw err;
      } finally {
        setLoading(false);
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = loadPromise;
    return loadPromise;
  };

  const createVideo = async (images, settings, audioFile = null) => {
    await load(); // always wait for successful load

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      throw new Error("FFmpeg failed to load properly");
    }

    setProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        const name = `img${String(i).padStart(3, "0")}.png`;
        const data = await fetchFile(images[i].url);
        await ffmpeg.writeFile(name, data);
      }

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

      const outName = `out.${settings.format}`;
      let ffmpegArgs;

      if (audioFile) {
        const audioData = await fetchFile(audioFile.url);
        await ffmpeg.writeFile("audio.mp3", audioData);
        const totalVideoDuration = images.length * settings.duration;

        ffmpegArgs = [
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          "list.txt",
          "-i",
          "audio.mp3",
          "-vf",
          "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
          "-r",
          String(settings.fps),
          "-pix_fmt",
          "yuv420p",
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-shortest",
          "-t",
          String(totalVideoDuration),
          "-y",
          outName,
        ];
      } else {
        ffmpegArgs = [
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
        ];
      }

      await ffmpeg.exec(ffmpegArgs);
      const outputData = await ffmpeg.readFile(outName);

      for (let i = 0; i < images.length; i++) {
        await ffmpeg.deleteFile(`img${String(i).padStart(3, "0")}.png`);
      }
      await ffmpeg.deleteFile("list.txt");
      await ffmpeg.deleteFile(outName);

      if (audioFile) {
        try {
          await ffmpeg.deleteFile("audio.mp3");
        } catch (_) {}
      }

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
