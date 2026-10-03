"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Preloader3D from "@/components/Preloader3D";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-[#050507] text-white overflow-x-hidden selection:bg-[#ccff00] selection:text-black">
      {/* 1. 3D Loading Screen & Asset Pre-warming */}
      <Preloader3D onComplete={() => setIsLoaded(true)} />

      {/* 2. Full Site with Synchronized Hero Entrance Animations */}
      <HeroSection isLoaded={isLoaded} />
    </main>
  );
}
