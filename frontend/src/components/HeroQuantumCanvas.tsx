"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroQuantumCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Perspective Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.03);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 7.5);

    // --- High-Performance WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- Elegant Minimal Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const neonLimeLight = new THREE.PointLight(0xccff00, 7.0, 20);
    neonLimeLight.position.set(0, 0, 0);
    scene.add(neonLimeLight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    cyanLight.position.set(-5, -4, 4);
    scene.add(cyanLight);

    // --- Master World Group ---
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const colorLime = new THREE.Color("#ccff00");
    const colorCyan = new THREE.Color("#00f0ff");
    const colorObsidian = new THREE.Color("#07090e");
    const colorChrome = new THREE.Color("#cbd5e1");

    // ==========================================
    // 1. QUANTUM CORE
    // ==========================================
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // Singularity Energy Sphere
    const coreGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colorLime,
      emissive: colorLime,
      emissiveIntensity: 4.5,
      roughness: 0.15,
    });
    const singularity = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(singularity);

    // Faceted Obsidian Cyber Shell
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

    // Laser Wireframe Lattice
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorLime,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new THREE.Mesh(shellGeo, wireMat);
    wireMesh.scale.set(1.03, 1.03, 1.03);
    coreGroup.add(wireMesh);

    // Outer Chrome Cage
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

    // ==========================================
    // 2. GYROSCOPE RINGS
    // ==========================================
    const orbitGroup = new THREE.Group();
    worldGroup.add(orbitGroup);

    // Ring 1: Neon Lime
    const ringGeo1 = new THREE.TorusGeometry(2.6, 0.02, 24, 160);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colorLime,
      transparent: true,
      opacity: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    orbitGroup.add(ring1);

    // Ring 2: Cyan Counter-Rotating Ring
    const ringGeo2 = new THREE.TorusGeometry(3.2, 0.015, 20, 140);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: colorCyan,
      transparent: true,
      opacity: 0.65,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.z = Math.PI / 6;
    orbitGroup.add(ring2);

    // ==========================================
    // 3. CLEAN BACKGROUND PARTICLES
    // ==========================================
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xccff00,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleGalaxy = new THREE.Points(particleGeo, particleMat);
    scene.add(particleGalaxy);

    // --- Responsive Layout Adjuster ---
    const updateLayout = () => {
      const width = container.clientWidth;
      if (width < 768) {
        worldGroup.position.set(0, 0, -1.0);
        worldGroup.scale.set(0.7, 0.7, 0.7);
      } else if (width < 1024) {
        worldGroup.position.set(0, 0, -0.4);
        worldGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        worldGroup.position.set(0, 0, 0);
        worldGroup.scale.set(1.0, 1.0, 1.0);
      }
    };
    updateLayout();

    // --- Interaction & Scroll Sync ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollProgress = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.45;
      targetMouseY = y * 0.35;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(window.innerHeight * 0.9, 1);
      scrollProgress = Math.min(scrollY / maxScroll, 2.0);
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateLayout();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Scroll-Driven Hyperspace Dive
      const scrollWarp = scrollProgress * 3.0;
      camera.position.z = 7.5 - scrollWarp * 1.5;
      camera.position.y = -scrollProgress * 1.0;

      // Smooth Rotations
      ring1.rotation.z = elapsedTime * 0.35 + scrollProgress * 2.0;
      ring2.rotation.z = -elapsedTime * 0.28 - scrollProgress * 1.5;

      // Core Animation
      const idleFloat = Math.sin(elapsedTime * 1.5) * 0.06;
      coreGroup.position.y = idleFloat;
      coreGroup.rotation.y = elapsedTime * 0.3 + mouseX * 0.7 + scrollProgress * 1.2;
      coreGroup.rotation.x = -mouseY * 0.4 + Math.cos(elapsedTime * 1.0) * 0.04;

      shellMesh.rotation.y = -elapsedTime * 0.18;
      wireMesh.rotation.y = elapsedTime * 0.35;
      outerMesh.rotation.x = elapsedTime * 0.2;

      // Pulse
      const corePulse = 4.0 + Math.sin(elapsedTime * 4) * 1.2;
      coreMat.emissiveIntensity = corePulse;

      // Particles
      particleGalaxy.rotation.y = elapsedTime * 0.02 + mouseX * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      wireMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
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

