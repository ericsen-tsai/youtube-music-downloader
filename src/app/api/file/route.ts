import ytdl from "ytdl-core";
import { type VideoFormat } from "@/app/utils/convertFileFormat";
import { PassThrough } from "stream";

export type GetFileResponse = {
  fileBuffer: Buffer;
  fileExtension: VideoFormat;
  videoTitle: string;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = decodeURI(searchParams.get("url") ?? "");

  try {
    const info = await ytdl.getInfo(url ?? "");
    const targetFormat = info.formats.find(
      (format) => format.container === "mp4",
    );

    const outputBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];

      const passThroughStream = new PassThrough();

      passThroughStream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      passThroughStream.on("end", () => {
        console.log("Download complete.");
        resolve(Buffer.concat(chunks));
      });
      passThroughStream.on("error", (err) => {
        console.log(err);
        reject(err);
      });

      ytdl
        .downloadFromInfo(info, {
          format: info.formats.find(
            (format) => format.hasAudio && !format.hasVideo,
          ),
        })
        .pipe(passThroughStream);
    });

    return Response.json({
      fileBuffer: outputBuffer,
      fileExtension: targetFormat?.container,
      videoTitle: info.videoDetails.title,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Conversion failed." });
  }
}
