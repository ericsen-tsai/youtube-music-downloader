"use client";

import { useState } from "react";

import convertFileFormat from "../utils/convertFileFormat";
import { type GetFileResponse } from "../api/file/route";

export function DownloadYoutubeMusic() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, setIsPending] = useState(false);
  const fetchVideoAndConvert = async () => {
    setIsPending(true);
    const data = (await fetch(`/api/file?url=${encodeURI(videoUrl)}`).then(
      (data) => data.json(),
    )) as GetFileResponse;

    const { fileBuffer: buffer, fileExtension: extension, videoTitle } = data;
    try {
      const fileData = await convertFileFormat({
        inputFile: buffer,
        inputFileExtension: extension,
        outputFilePath: `${videoTitle}.wav`,
      });

      const url = URL.createObjectURL(new Blob([fileData]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoTitle}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void fetchVideoAndConvert();
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Youtube URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
