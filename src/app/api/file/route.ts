import fs from "fs";
import ytdl from "ytdl-core";
import { readFile } from "fs/promises";
import { type VideoFormat } from "@/app/utils/convertFileFormat";

export type GetFileResponse = {
  fileBuffer: Buffer;
  fileExtension: VideoFormat;
  videoTitle: string;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = decodeURI(searchParams.get("url") ?? "");
  let filename = "";

  try {
    const info = await ytdl.getInfo(url ?? "");
    const targetFormat = info.formats.find(
      (format) => format.container === "mp4",
    );
    filename = `tmp.${targetFormat?.container ?? ""}`;
    const outputStream: fs.WriteStream = fs.createWriteStream(filename);

    ytdl
      .downloadFromInfo(info, {
        format: info.formats.find(
          (format) => format.hasAudio && !format.hasVideo,
        ),
      })
      .pipe(outputStream);

    await new Promise((resolve, reject) => {
      outputStream.on("finish", () =>
        resolve(console.log("Download finished!")),
      );
      outputStream.on("error", (err) => {
        console.log(err);
        reject(err);
      });
    });

    const fileBuffer = await readFile(filename);
    const fileBufferCopy = Buffer.from(fileBuffer);

    fs.unlinkSync(filename);

    return Response.json({
      fileBuffer: fileBufferCopy,
      fileExtension: targetFormat?.container,
      videoTitle: info.videoDetails.title,
    });
  } catch (error) {
    console.error(error);
    fs.unlinkSync(filename);
    return Response.json({ error: "Conversion failed." });
  }
}
