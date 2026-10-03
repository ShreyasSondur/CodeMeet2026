"use client";

import { useEffect, useState } from "react";
import { soundFX } from "@/lib/audio";
import { VolumeX, Volume2 } from "lucide-react";

export default function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Subscribe to sound engine state changes
    const unsubscribe = soundFX.subscribe((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    soundFX.toggleBGM();
  };

  return (
    <div className="pointer-events-auto select-none">
      <button
        onClick={handleToggle}
        onMouseEnter={() => soundFX.playHover()}
        aria-label={isPlaying ? "Turn Audio Off" : "Turn Audio On"}
        className={`group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer ${
          isPlaying
            ? "bg-black/85 border-[#ccff00]/70 shadow-[0_0_20px_rgba(204,255,0,0.3)] text-[#ccff00]"
            : "bg-black/70 border-white/15 hover:border-[#ccff00]/40 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        {/* Equalizer or Mute Icon */}
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5 w-4 pb-0.5">
            <span className="w-[3px] bg-[#ccff00] rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2" />
            <span className="w-[3px] bg-[#ccff00] rounded-full animate-[pulse_0.3s_ease-in-out_infinite_0.1s] h-3.5" />
            <span className="w-[3px] bg-[#ccff00] rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-1.5" />
            <span className="w-[3px] bg-[#ccff00] rounded-full animate-[pulse_0.35s_ease-in-out_infinite_0.15s] h-3" />
          </div>
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        )}

        {/* Clean Status Label */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] tracking-wider font-semibold uppercase">
          <span>{isPlaying ? "AUDIO ON" : "AUDIO OFF"}</span>
        </div>

        {/* Indicator Dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all ${
            isPlaying
              ? "bg-[#ccff00] shadow-[0_0_8px_#ccff00] animate-ping"
              : "bg-zinc-600 group-hover:bg-zinc-400"
          }`}
        />
      </button>
    </div>
  );
}
