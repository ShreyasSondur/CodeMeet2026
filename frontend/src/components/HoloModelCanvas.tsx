"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HoloModelCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene & Perspective Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    camera.position.set(0, 0, 4.0);

    // --- High-Performance WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const limeLight = new THREE.PointLight(0xccff00, 4.5, 10);
    limeLight.position.set(2, 3, 3);
    scene.add(limeLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3.5, 10);
    cyanLight.position.set(-2, -3, 2);
    scene.add(cyanLight);

    // --- Master 3D Object Group ---
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Outer Holographic Wireframe Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.25, 0);
    const icoWireMat = new THREE.MeshStandardMaterial({
      color: 0xccff00,
      wireframe: true,
      emissive: 0xccff00,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoWireMat);
    masterGroup.add(icoMesh);

    // 2. Inner Glowing Octahedron Core
    const coreGeo = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // 3. Dual Cyber Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(1.65, 0.02, 12, 60);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xccff00,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    masterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.5, 0.015, 12, 60);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    masterGroup.add(ring2);

    // 4. Lightweight Quantum Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const limeColor = new THREE.Color(0xccff00);
    const cyanColor = new THREE.Color(0x00f0ff);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.3 + Math.random() * 0.8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const chosenColor = Math.random() > 0.5 ? limeColor : cyanColor;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // --- Interactive Mouse Movement ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.7;
      targetY = y * 0.7;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // --- Animation Loop with Visibility Gating ---
    let animationFrameId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      masterGroup.rotation.y = elapsedTime * 0.4 + mouseX;
      masterGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2 + mouseY;

      icoMesh.rotation.y = -elapsedTime * 0.3;
      coreMesh.rotation.y = elapsedTime * 0.6;
      coreMesh.rotation.z = Math.sin(elapsedTime * 0.5) * 0.4;

      ring1.rotation.z = elapsedTime * 0.5;
      ring2.rotation.x = elapsedTime * 0.4;
      particleSystem.rotation.y = -elapsedTime * 0.15;

      const scale = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
      coreMesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          animate();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    animate();

    // --- Resize Observer ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);

      renderer.dispose();
      icoGeo.dispose();
      icoWireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full aspect-square max-w-[380px] mx-auto cursor-grab active:cursor-grabbing select-none"
    />
  );
}
