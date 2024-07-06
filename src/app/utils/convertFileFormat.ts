import { FFmpeg } from "@ffmpeg/ffmpeg";
import { type videoFormat } from "ytdl-core";

export type VideoFormat = videoFormat["container"];

async function convertFileFormat({
  inputFile,
  inputFileExtension,
  outputFilePath,
}: {
  inputFile: Buffer;
  inputFileExtension: VideoFormat;
  outputFilePath: string;
}) {
  const inputFilePath = `temp_video.${inputFileExtension}`;
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  await ffmpeg.writeFile(inputFilePath, Buffer.from(inputFile));

  await ffmpeg.exec(["-i", inputFilePath, outputFilePath]);

  const data = ffmpeg.readFile(outputFilePath);

  return data;
}

export default convertFileFormat;
