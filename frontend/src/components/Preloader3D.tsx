"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { soundFX } from "@/lib/audio";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader3D({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const progressRef = useRef(0);

  // Clean, High-End 3D Quantum Core
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Subtle, elegant lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambLight);

    const limeLight = new THREE.PointLight(0xccff00, 7, 20);
    limeLight.position.set(0, 0, 0);
    scene.add(limeLight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    cyanLight.position.set(-5, -4, 4);
    scene.add(cyanLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const colorLime = new THREE.Color("#ccff00");
    const colorCyan = new THREE.Color("#00f0ff");
    const colorObsidian = new THREE.Color("#07090e");
    const colorChrome = new THREE.Color("#cbd5e1");

    // Core Group
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // Singularity Sphere
    const coreGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colorLime,
      emissive: colorLime,
      emissiveIntensity: 4.5,
      roughness: 0.15,
    });
    const singularity = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(singularity);

    // Obsidian Faceted Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: colorObsidian,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 1.0,
      flatShading: true,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    coreGroup.add(shellMesh);

    // Laser Wireframe
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorLime,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new THREE.Mesh(shellGeo, wireMat);
    wireMesh.scale.set(1.03, 1.03, 1.03);
    coreGroup.add(wireMesh);

    // Outer Chrome Dodecahedron Cage
    const outerGeo = new THREE.DodecahedronGeometry(1.8, 0);
    const outerMat = new THREE.MeshStandardMaterial({
      color: colorChrome,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // Clean Torus Gyro Rings
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.02, 24, 160);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: colorLime,
      transparent: true,
      opacity: 0.9,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.3;
    worldGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.2, 0.015, 20, 140);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: colorCyan,
      transparent: true,
      opacity: 0.65,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.z = Math.PI / 6;
    worldGroup.add(ring2);

    // Clean Subtle Background Particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleDistances = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleDistances[i] = 1.8 + Math.random() * 8.0;
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.5 + Math.random() * 1.2;

      particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleDistances[i];
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleDistances[i];
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xccff00,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleGalaxy = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particleGalaxy);

    let animId: number;
    let clock = new THREE.Clock();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const charge = 1.0 + (progressRef.current / 100) * 2.5;

      coreGroup.rotation.x += delta * 0.35 * charge;
      coreGroup.rotation.y += delta * 0.55 * charge;
      shellMesh.rotation.y -= delta * 0.25 * charge;
      wireMesh.rotation.y += delta * 0.4 * charge;

      ring1.rotation.z += delta * 0.5 * charge;
      ring2.rotation.z -= delta * 0.4 * charge;

      const pulse = 1 + Math.sin(time * 5) * 0.06;
      singularity.scale.set(pulse, pulse, pulse);

      // Particle inward drift
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += delta * (0.6 + 1.0 / particleDistances[i]) * charge;
        particleDistances[i] -= delta * 0.7 * charge;

        if (particleDistances[i] < 1.0) {
          particleDistances[i] = 8.0 + Math.random() * 2.0;
        }

        posArr[i * 3] = Math.cos(particleAngles[i]) * particleDistances[i];
        posArr[i * 3 + 2] = Math.sin(particleAngles[i]) * particleDistances[i];
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smooth warp transition at 100%
      if (progressRef.current >= 100 && camera.position.z > 1.0) {
        camera.position.z -= delta * 12.0;
        worldGroup.scale.multiplyScalar(1.03);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      wireMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  // Smooth & fast progress counter
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      const step = Math.floor(Math.random() * 5) + 3;
      current = Math.min(100, current + step);
      progressRef.current = current;
      setProgress(current);

      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsWarping(true);
          soundFX.playSuccess();
          setTimeout(() => {
            setIsExited(true);
            onComplete();
          }, 500);
        }, 200);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (isExited) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="preloader-overlay"
        initial={{ opacity: 1 }}
        animate={isWarping ? { opacity: 0, scale: 1.05, filter: "blur(10px)" } : { opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[999999] bg-[#050507] text-white flex flex-col items-center justify-between p-8 sm:p-12 overflow-hidden select-none pointer-events-auto"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/8 rounded-full blur-[200px] pointer-events-none" />

        {/* 3D Background Three.js Quantum Scene */}
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0" />

        {/* Top Minimal Label */}
        <div className="relative z-10 w-full max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="tracking-widest font-semibold text-zinc-300">CODE MEET 2026</span>
          </div>
          <div className="font-mono text-xs text-zinc-500 hidden sm:block">
            24H HACKATHON
          </div>
        </div>

        {/* Minimal Centerpiece */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 my-auto">
          {/* Main Clean Title */}
          <div className="flex flex-col items-center leading-none">
            <div className="font-[family-name:var(--font-orbitron)] font-black text-5xl sm:text-7xl md:text-8xl tracking-widest text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
              LOAD<span className="text-[#ccff00] glow-text-lime">ING</span>
            </div>
          </div>

          {/* Minimalist Numeric Percentage */}
          <div className="pt-2 flex items-baseline gap-1 font-[family-name:var(--font-orbitron)] font-bold text-4xl sm:text-5xl text-white">
            <span className="text-[#ccff00]">{progress}</span>
            <span className="text-zinc-600 text-2xl">%</span>
          </div>
        </div>

        {/* Minimal Bottom Progress Bar */}
        <div className="relative z-10 w-full max-w-md mx-auto space-y-2">
          <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ccff00] shadow-[0_0_12px_#ccff00] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>{progress === 100 ? "READY" : "LOADING..."}</span>
            <span>SUIET</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


