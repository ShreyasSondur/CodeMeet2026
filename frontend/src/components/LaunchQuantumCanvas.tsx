"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type LaunchPhase = "idle" | "intro" | "countdown" | "ignite" | "live";

interface LaunchQuantumCanvasProps {
  phase: LaunchPhase;
  countdownNumber: number; // 5, 4, 3, 2, 1, 0
}

export default function LaunchQuantumCanvas({
  phase,
  countdownNumber,
}: LaunchQuantumCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<LaunchPhase>(phase);
  const countdownRef = useRef<number>(countdownNumber);

  useEffect(() => {
    phaseRef.current = phase;
    countdownRef.current = countdownNumber;
  }, [phase, countdownNumber]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Perspective Camera, and Fog ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(0, 0, 7.5);

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- Dynamic Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const limePointLight = new THREE.PointLight(0xccff00, 8.0, 30);
    limePointLight.position.set(0, 0, 0);
    scene.add(limePointLight);

    const cyanDirectionalLight = new THREE.DirectionalLight(0x00f0ff, 3.0);
    cyanDirectionalLight.position.set(-6, -4, 5);
    scene.add(cyanDirectionalLight);

    const violetTopLight = new THREE.PointLight(0xa855f7, 4.0, 25);
    violetTopLight.position.set(0, 6, 2);
    scene.add(violetTopLight);

    // --- Master World Group ---
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const colorLime = new THREE.Color("#ccff00");
    const colorCyan = new THREE.Color("#00f0ff");
    const colorObsidian = new THREE.Color("#07090e");
    const colorChrome = new THREE.Color("#cbd5e1");
    const colorWhite = new THREE.Color("#ffffff");

    // ==========================================
    // 1. QUANTUM CORE (Singularity & Cyber Shell)
    // ==========================================
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // Singularity Energy Sphere
    const coreGeo = new THREE.SphereGeometry(0.7, 48, 48);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colorLime,
      emissive: colorLime,
      emissiveIntensity: 5.0,
      roughness: 0.1,
    });
    const singularity = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(singularity);

    // Faceted Obsidian Cyber Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: colorObsidian,
      roughness: 0.12,
      metalness: 0.95,
      clearcoat: 1.0,
      flatShading: true,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    coreGroup.add(shellMesh);

    // Laser Wireframe Lattice
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorLime,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireMesh = new THREE.Mesh(shellGeo, wireMat);
    wireMesh.scale.set(1.04, 1.04, 1.04);
    coreGroup.add(wireMesh);

    // Outer Chrome Dodecahedron Cage
    const outerGeo = new THREE.DodecahedronGeometry(1.9, 0);
    const outerMat = new THREE.MeshStandardMaterial({
      color: colorChrome,
      metalness: 0.92,
      roughness: 0.18,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // Energy Shockwave Ring Geometry
    const shockwaveGeo = new THREE.RingGeometry(0.2, 0.28, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: colorLime,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    worldGroup.add(shockwaveMesh);

    // ==========================================
    // 2. GYROSCOPIC ACCELERATOR RINGS
    // ==========================================
    const orbitGroup = new THREE.Group();
    worldGroup.add(orbitGroup);

    // Ring 1: Neon Lime Primary Ring
    const ringGeo1 = new THREE.TorusGeometry(2.7, 0.025, 24, 180);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colorLime,
      transparent: true,
      opacity: 0.95,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.2;
    orbitGroup.add(ring1);

    // Ring 2: Cyan Counter-Orbit Ring
    const ringGeo2 = new THREE.TorusGeometry(3.3, 0.02, 20, 160);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: colorCyan,
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 1.6;
    ring2.rotation.z = Math.PI / 5;
    orbitGroup.add(ring2);

    // Ring 3: Outer Violet Gyro Ring
    const ringGeo3 = new THREE.TorusGeometry(3.9, 0.015, 16, 140);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#c084fc"),
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.y = Math.PI / 3;
    ring3.rotation.z = Math.PI / 4;
    orbitGroup.add(ring3);

    // ==========================================
    // 3. WARP TUNNEL & PARTICLES
    // ==========================================
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleDistances = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleYOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleDistances[i] = 1.5 + Math.random() * 12.0;
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.8 + Math.random() * 2.0;
      particleYOffsets[i] = (Math.random() - 0.5) * 8.0;

      particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleDistances[i];
      particlePositions[i * 3 + 1] = particleYOffsets[i];
      particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleDistances[i];
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xccff00,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleGalaxy = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particleGalaxy);

    // --- Interactive Pointer Damping ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.5;
      targetMouseY = y * 0.4;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animId: number;
    const clock = new THREE.Clock();
    let shockwaveScale = 0;
    let shockwaveAlpha = 0;
    let lastCountdown = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const curPhase = phaseRef.current;
      const curCount = countdownRef.current;

      // Detect countdown number change to trigger shockwave burst
      if (curPhase === "countdown" && curCount !== lastCountdown && curCount > 0) {
        lastCountdown = curCount;
        shockwaveScale = 0.5;
        shockwaveAlpha = 1.0;
      }

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Phase-dependent speed multiplier
      let speedMult = 1.0;
      let coreScale = 1.0;
      let emissivePower = 5.0;

      if (curPhase === "idle") {
        speedMult = 1.0;
        camera.position.z = 7.5;
        camera.position.y = 0;
        coreMat.color.lerp(colorLime, 0.08);
        coreMat.emissive.lerp(colorLime, 0.08);
      } else if (curPhase === "intro") {
        speedMult = 2.2;
        camera.position.z = 7.0 + Math.sin(elapsedTime * 2) * 0.2;
        coreMat.color.lerp(colorCyan, 0.08);
        coreMat.emissive.lerp(colorCyan, 0.08);
        emissivePower = 7.0;
      } else if (curPhase === "countdown") {
        // Accelerate drastically as countdown decreases from 5 to 1
        const intensity = Math.max(1, 6 - curCount);
        speedMult = 2.5 + intensity * 1.5;
        coreScale = 1.0 + (intensity * 0.08);
        emissivePower = 6.0 + intensity * 2.0;

        // Camera shakes slightly on higher countdown steps
        const shake = (intensity * 0.015) * (Math.random() - 0.5);
        camera.position.x = mouseX * 0.6 + shake;
        camera.position.y = mouseY * 0.4 + shake;
        camera.position.z = 7.2 - intensity * 0.4;

        if (curCount <= 2) {
          coreMat.color.lerp(colorWhite, 0.1);
          coreMat.emissive.lerp(colorWhite, 0.1);
        } else {
          coreMat.color.lerp(colorLime, 0.1);
          coreMat.emissive.lerp(colorLime, 0.1);
        }
      } else if (curPhase === "ignite") {
        speedMult = 12.0;
        emissivePower = 18.0;
        coreScale = 2.2;
        // Hyperdrive forward dive
        camera.position.z -= delta * 18.0;
        worldGroup.scale.multiplyScalar(1.02);
      } else if (curPhase === "live") {
        // Seamlessly synchronized to the HeroSection idle state
        speedMult = 1.0;
        camera.position.set(0, 0, 7.5);
        camera.position.x = mouseX * 0.4;
        camera.position.y = mouseY * 0.3;
        worldGroup.scale.set(1, 1, 1);
        coreMat.color.lerp(colorLime, 0.05);
        coreMat.emissive.lerp(colorLime, 0.05);
      }

      // Shockwave animation
      if (shockwaveAlpha > 0) {
        shockwaveScale += delta * 12.0;
        shockwaveAlpha -= delta * 1.8;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
        shockwaveMat.opacity = Math.max(0, shockwaveAlpha);
      }

      // Continuous Rotations
      coreGroup.rotation.y += delta * 0.6 * speedMult;
      coreGroup.rotation.x += delta * 0.3 * speedMult;
      shellMesh.rotation.y -= delta * 0.35 * speedMult;
      wireMesh.rotation.y += delta * 0.5 * speedMult;
      outerMesh.rotation.x += delta * 0.25 * speedMult;

      ring1.rotation.z += delta * 0.7 * speedMult;
      ring2.rotation.z -= delta * 0.55 * speedMult;
      ring3.rotation.y += delta * 0.4 * speedMult;

      // Pulse & scale
      const idleFloat = Math.sin(elapsedTime * 2.0) * 0.08;
      coreGroup.position.y = idleFloat;
      const breathing = 1.0 + Math.sin(elapsedTime * (curPhase === "countdown" ? 10 : 3)) * 0.05;
      singularity.scale.set(coreScale * breathing, coreScale * breathing, coreScale * breathing);
      coreMat.emissiveIntensity = emissivePower + Math.sin(elapsedTime * 6) * 1.5;

      // Vortex Particles flow
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += delta * (0.8 + 2.0 / particleDistances[i]) * speedMult;
        
        if (curPhase === "ignite") {
          // Warp streaks
          posArr[i * 3 + 2] += delta * 25.0;
          if (posArr[i * 3 + 2] > 10.0) posArr[i * 3 + 2] = -30.0;
        } else {
          particleDistances[i] -= delta * 0.9 * speedMult;
          if (particleDistances[i] < 0.8) {
            particleDistances[i] = 12.0 + Math.random() * 3.0;
          }
          posArr[i * 3] = Math.cos(particleAngles[i]) * particleDistances[i];
          posArr[i * 3 + 2] = Math.sin(particleAngles[i]) * particleDistances[i];
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      wireMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden select-none"
    />
  );
}
