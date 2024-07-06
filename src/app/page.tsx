import { DownloadYoutubeMusic } from "@/app/_components/download-youtube-music";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-xs">
        <DownloadYoutubeMusic />
      </div>
    </main>
  );
}
