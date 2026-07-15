import React from "react";
import { Play, Pause, Music, Clock } from "lucide-react";

export default function SongList({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  selectedLetter,
  onChangeFilterMode
}) {
  if (songs.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(212,163,42,0.18)] bg-[#121826]/70 p-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4A32A]/25 bg-[#D4A32A]/10">
          <Music className="w-6 h-6 text-[#D4A32A]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">No Songs Found</h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-[#B8BEC9]">
          There are no songs starting with the letter <span className="text-[#D4A32A] font-bold">"{selectedLetter}"</span> in this language catalog.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onChangeFilterMode("all")}
            className="rounded-full bg-[#D4A32A] px-4 py-2 text-xs font-bold text-black shadow-[0_0_12px_rgba(212,163,42,0.3)] transition-all duration-200 hover:bg-[#E5B43B] hover:scale-105 active:scale-95"
          >
            Switch filter to "All"
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(212,163,42,0.18)] bg-[#121826] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(212,163,42,0.18)] bg-[#151B28]/85 text-[10px] font-bold uppercase tracking-wider text-[#B8BEC9]">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 hidden sm:table-cell">Album</th>
              <th className="py-3 px-4 hidden md:table-cell">Plays</th>
              <th className="py-3 px-4 w-16 text-center">
                <Clock className="w-3.5 h-3.5 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              
              return (
                <tr
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`border-b border-white/5 hover:bg-[#151B28]/50 transition-colors group cursor-pointer ${
                    isCurrent ? "bg-[#D4A32A]/10 text-white" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-center text-xs font-medium text-[#B8BEC9]">
                    <span className="group-hover:hidden">
                        {isCurrentPlaying ? (
                          <div className="mx-auto flex h-3 w-3 items-end justify-center gap-0.5">
                            <span className="w-0.5 bg-[#D4A32A] animate-music-bar-1"></span>
                            <span className="w-0.5 bg-[#D4A32A] animate-music-bar-2"></span>
                            <span className="w-0.5 bg-[#D4A32A] animate-music-bar-3"></span>
                          </div>
                        ) : (
                          index + 1
                        )}
                    </span>
                    <span className="hidden group-hover:inline-block">
                      {isCurrentPlaying ? (
                        <Pause className="w-3 h-3 text-[#D4A32A] fill-current" />
                      ) : (
                        <Play className="w-3 h-3 text-[#D4A32A] fill-current" />
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-9 h-9 object-cover rounded border border-white/10"
                      />
                      <div className="min-w-0">
                        <span
                          className={`font-semibold block truncate ${
                            isCurrent ? "text-[#D4A32A]" : "text-white"
                          }`}
                        >
                          {song.title}
                        </span>
                        <span className="text-xs text-[#B8BEC9] block truncate">
                          {song.artist}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-[#B8BEC9]">
                    {song.album}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-xs text-[#B8BEC9] tabular-nums">
                    {song.plays.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#B8BEC9] tabular-nums">
                    {song.duration}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
