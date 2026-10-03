"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { soundFX } from "@/lib/audio";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  Crown,
} from "lucide-react";

interface Milestone3D {
  id: string;
  phase: number;
  phaseTitle: string;
  date: string;
  time: string;
  title: string;
  subtitle: string;
  description: string;
  fee?: string;
  prize?: string;
  tag: string;
  side: "left" | "right" | "center";
  t: number;
  color: string;
}

const MILESTONES_3D: Milestone3D[] = [
  {
    id: "m1",
    phase: 1,
    phaseTitle: "PHASE 01: REGISTRATION & SCREENING",
    date: "OCTOBER 01",
    time: "PORTAL LAUNCH",
    title: "Registration Begins",
    subtitle: "ROUND 1 ONLINE ENTRY",
    description: "Official registration opens for Round 1 online screening round across national colleges.",
    fee: "₹100 / Team",
    tag: "PORTAL OPEN",
    side: "left",
    t: 0.12,
    color: "#ccff00",
  },
  {
    id: "m2",
    phase: 1,
    phaseTitle: "PHASE 01: REGISTRATION & SCREENING",
    date: "OCTOBER 22",
    time: "11:59 PM IST",
    title: "Registration Closes",
    subtitle: "SUBMISSION DEADLINE",
    description: "Final deadline for Round 1 online registration and idea submissions.",
    tag: "DEADLINE",
    side: "right",
    t: 0.22,
    color: "#00f0ff",
  },
  {
    id: "m3",
    phase: 1,
    phaseTitle: "PHASE 01: REGISTRATION & SCREENING",
    date: "OCTOBER 23 - 24",
    time: "48H SPRINT",
    title: "Round 1: Online Hack",
    subtitle: "ONLINE SCREENING ROUND",
    description: "Round 1 online screening challenge where teams build & submit prototype solution.",
    tag: "VIRTUAL ROUND",
    side: "left",
    t: 0.32,
    color: "#ccff00",
  },
  {
    id: "m4",
    phase: 2,
    phaseTitle: "PHASE 02: SHORTLIST & ADVANCEMENT",
    date: "OCTOBER 25",
    time: "OFFICIAL LIST",
    title: "Round 1 Results Out",
    subtitle: "TOP 30 TEAMS ANNOUNCED",
    description: "Jury declares Top 30 shortlisted teams advancing to the 24H offline grand finale.",
    tag: "RESULTS",
    side: "right",
    t: 0.48,
    color: "#00f0ff",
  },
  {
    id: "m5",
    phase: 2,
    phaseTitle: "PHASE 02: SHORTLIST & ADVANCEMENT",
    date: "OCTOBER 25 - 30",
    time: "SEAT CONFIRMATION",
    title: "Round 2 Registration",
    subtitle: "FINALIST PASS CONFIRMATION",
    description: "Shortlisted Top 30 teams confirm seats for the 24H on-campus grand finale at SUIET Mukka.",
    fee: "₹500 / Team",
    tag: "FINALISTS ONLY",
    side: "left",
    t: 0.58,
    color: "#ccff00",
  },
  {
    id: "m6",
    phase: 3,
    phaseTitle: "PHASE 03: 24H OFFLINE GRAND FINALE",
    date: "NOVEMBER 01",
    time: "9:30 AM KICKOFF",
    title: "Round 2: 24H Offline Begins",
    subtitle: "OFFLINE SPRINT AT SUIET",
    description: "24-hour non-stop national offline coding showdown begins on-campus with mentorship.",
    tag: "24H BUILD",
    side: "right",
    t: 0.74,
    color: "#f59e0b",
  },
  {
    id: "m7",
    phase: 3,
    phaseTitle: "PHASE 03: 24H OFFLINE GRAND FINALE",
    date: "NOVEMBER 02",
    time: "9:30 AM - 1:00 PM",
    title: "Judging & Demos",
    subtitle: "PROJECT PRESENTATIONS",
    description: "Teams pitch working prototypes to jury panels with live architecture demos & Q&A.",
    tag: "EVALUATION",
    side: "left",
    t: 0.86,
    color: "#ccff00",
  },
  {
    id: "m8",
    phase: 3,
    phaseTitle: "PHASE 03: 24H OFFLINE GRAND FINALE",
    date: "NOVEMBER 02",
    time: "4:00 PM CEREMONY",
    title: "Grand Results & Awards",
    subtitle: "WINNER FELICITATION",
    description: "Grand closing ceremony & winner felicitation. 1st Place: ₹20,000 cash prize, 2nd Place: ₹10,000 cash prize, trophies and certificates.",
    prize: "1ST PRIZE: ₹20,000  •  2ND PRIZE: ₹10,000",
    tag: "VICTORY ARENA",
    side: "center",
    t: 0.98,
    color: "#ccff00",
  },
];

const PHASE_GANTRIES = [
  { t: 0.04, title: "PHASE 01: REGISTRATION & SCREENING", color: "#ccff00", subtitle: "ROUND 1 • VIRTUAL CHALLENGE" },
  { t: 0.40, title: "PHASE 02: SHORTLIST & ADVANCEMENT", color: "#00f0ff", subtitle: "TOP 30 TEAMS ADVANCE" },
  { t: 0.67, title: "PHASE 03: 24H OFFLINE GRAND FINALE", color: "#f59e0b", subtitle: "SRINIVAS UNIVERSITY (SUIET) MUKKA" },
];

export default function Timeline3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastYRef = useRef(0);
  const celebrationFiredRef = useRef(false);

  // Trigger celebration confetti
  const triggerCelebration = useCallback(() => {
    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ccff00", "#00f0ff", "#f59e0b", "#ffffff"],
      });
    } catch {
      // ignore
    }
  }, []);

  // Generate Billboard Canvas Texture (Wide, Crisp, High-Contrast)
  const createBillboardTexture = useCallback((m: Milestone3D) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark sleek gradient
    const grad = ctx.createLinearGradient(0, 0, 1280, 640);
    grad.addColorStop(0, "#0a0e14");
    grad.addColorStop(1, "#030507");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 640);

    // Subtle cyber grid
    ctx.strokeStyle = "rgba(204, 255, 0, 0.06)";
    ctx.lineWidth = 2;
    for (let x = 0; x < 1280; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // Outer Glowing Border
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, 1244, 604);

    // Corner Reticles
    ctx.fillStyle = m.color;
    ctx.fillRect(18, 18, 44, 12);
    ctx.fillRect(18, 18, 12, 44);
    ctx.fillRect(1218, 18, 44, 12);
    ctx.fillRect(1250, 18, 12, 44);
    ctx.fillRect(18, 610, 44, 12);
    ctx.fillRect(18, 578, 12, 44);
    ctx.fillRect(1218, 610, 44, 12);
    ctx.fillRect(1250, 578, 12, 44);

    // Top Header Pill: Date & Tag
    ctx.fillStyle = "rgba(204, 255, 0, 0.12)";
    ctx.fillRect(45, 45, 1190, 100);

    // Date
    ctx.fillStyle = m.color;
    ctx.font = "900 52px 'Orbitron', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(m.date, 70, 112);

    // Tag & Time Pill
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`[ ${m.tag} • ${m.time} ]`, 1210, 108);

    // Title
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 64px 'Orbitron', sans-serif";
    ctx.fillText(m.title, 70, 230);

    // Subtitle
    ctx.fillStyle = m.color;
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.fillText(m.subtitle, 70, 285);

    // Description text (word wrap)
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "30px 'Inter', sans-serif";
    const words = m.description.split(" ");
    let line = "";
    let yPos = 350;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1140 && n > 0) {
        ctx.fillText(line, 70, yPos);
        line = words[n] + " ";
        yPos += 42;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 70, yPos);

    // Prize or Fee Banner at bottom
    if (m.prize) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(45, 520, 1190, 80);
      ctx.fillStyle = "#000000";
      ctx.font = "900 36px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`🏆 ${m.prize}`, 640, 574);
    } else if (m.fee) {
      ctx.fillStyle = "#ccff00";
      ctx.font = "900 36px 'Orbitron', monospace";
      ctx.fillText(`ENTRY FEE: ${m.fee}`, 70, 565);
    } else {
      ctx.fillStyle = "rgba(204, 255, 0, 0.6)";
      ctx.font = "26px 'Courier New', monospace";
      ctx.fillText("CODEMEET 2026 // SUIET HACKATHON ROADMAP", 70, 565);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // Generate Gantry Banner Texture
  const createGantryTexture = useCallback((g: (typeof PHASE_GANTRIES)[0]) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(8, 12, 16, 0.95)";
    ctx.fillRect(0, 0, 1600, 400);

    ctx.fillStyle = "rgba(204, 255, 0, 0.08)";
    for (let x = 20; x < 1580; x += 24) {
      for (let y = 20; y < 380; y += 24) {
        ctx.fillRect(x, y, 4, 4);
      }
    }

    ctx.strokeStyle = g.color;
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, 1572, 372);

    ctx.strokeStyle = "rgba(204, 255, 0, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, 1544, 344);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 70px 'Orbitron', sans-serif";
    ctx.fillText(g.title, 800, 190);

    ctx.fillStyle = g.color;
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.fillText(g.subtitle, 800, 275);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 750;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.006);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Highway Curve Points
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -80),
      new THREE.Vector3(20, 2, -180),
      new THREE.Vector3(35, 3, -280),
      new THREE.Vector3(10, 1, -380),
      new THREE.Vector3(-25, 0, -480),
      new THREE.Vector3(-35, -1, -580),
      new THREE.Vector3(-10, 1, -680),
      new THREE.Vector3(15, 2, -780),
      new THREE.Vector3(0, 0, -900),
      new THREE.Vector3(0, 0, -980),
    ];

    const highwayCurve = new THREE.CatmullRomCurve3(curvePoints, false, "centripetal");

    // Multi-Stripe Highway Lines
    const numStripes = 30;
    const stripeSpacing = 0.58;
    const highwayGroup = new THREE.Group();

    const sampleCount = 650;
    const curveSamples = highwayCurve.getPoints(sampleCount);
    const frenetFrames = highwayCurve.computeFrenetFrames(sampleCount, false);

    for (let s = 0; s < numStripes; s++) {
      const offset = (s - numStripes / 2) * stripeSpacing;
      const stripePoints: THREE.Vector3[] = [];

      for (let i = 0; i <= sampleCount; i++) {
        const p = curveSamples[i];
        const binormal = frenetFrames.binormals[i];
        const offsetPt = new THREE.Vector3().copy(p).addScaledVector(binormal, offset);
        stripePoints.push(offsetPt);
      }

      const stripeGeom = new THREE.BufferGeometry().setFromPoints(stripePoints);
      const distFromCenter = Math.abs(s - numStripes / 2) / (numStripes / 2);
      let stripeColor = new THREE.Color();
      let opacity = 0.85;

      if (distFromCenter < 0.22) {
        stripeColor.setHex(0xccff00); // Electric Lime
        opacity = 0.98;
      } else if (distFromCenter < 0.55) {
        stripeColor.setHex(0x00f0ff); // Cyan
        opacity = 0.8;
      } else {
        stripeColor.setHex(0x10b981); // Emerald
        opacity = 0.55;
      }

      const stripeMat = new THREE.LineBasicMaterial({
        color: stripeColor,
        transparent: true,
        opacity,
        linewidth: 2,
      });

      const line = new THREE.Line(stripeGeom, stripeMat);
      highwayGroup.add(line);
    }
    scene.add(highwayGroup);

    // Floating Cyber Particles
    const particleCount = 1200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const pt = highwayCurve.getPointAt(t);
      particlePositions[i * 3] = pt.x + (Math.random() - 0.5) * 140;
      particlePositions[i * 3 + 1] = pt.y + (Math.random() - 0.3) * 70;
      particlePositions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 100;

      const pColor = new THREE.Color();
      pColor.setHex(Math.random() > 0.4 ? 0xccff00 : 0x00f0ff);
      particleColors[i * 3] = pColor.r;
      particleColors[i * 3 + 1] = pColor.g;
      particleColors[i * 3 + 2] = pColor.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 3D Floating Celebration Cubes at the End (Winner Arena)
    const celebrationCubesGroup = new THREE.Group();
    const cubeCount = 60;
    const cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xccff00, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
    ];

    const finalPt = highwayCurve.getPointAt(0.98);
    const cubes: { mesh: THREE.Mesh; rotSpeed: THREE.Vector3; initialY: number }[] = [];

    for (let i = 0; i < cubeCount; i++) {
      const mat = cubeMaterials[i % cubeMaterials.length];
      const cube = new THREE.Mesh(cubeGeom, mat);
      cube.position.set(
        finalPt.x + (Math.random() - 0.5) * 60,
        finalPt.y + Math.random() * 30 + 2,
        finalPt.z + (Math.random() - 0.5) * 40
      );
      celebrationCubesGroup.add(cube);
      cubes.push({
        mesh: cube,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04
        ),
        initialY: cube.position.y,
      });
    }
    scene.add(celebrationCubesGroup);

    // Overhead Gantries
    PHASE_GANTRIES.forEach((g) => {
      const tex = createGantryTexture(g);
      if (!tex) return;

      const gantryGeom = new THREE.PlaneGeometry(42, 10.5);
      const gantryMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const gantryMesh = new THREE.Mesh(gantryGeom, gantryMat);

      const pt = highwayCurve.getPointAt(g.t);
      gantryMesh.position.copy(pt).add(new THREE.Vector3(0, 11, 0));
      gantryMesh.rotation.set(0, 0, 0);
      scene.add(gantryMesh);
    });

    // Milestone Billboards (Generously Spaced & Scaled for Full Visibility)
    const billboardMeshes: { mesh: THREE.Mesh; m: Milestone3D }[] = [];
    MILESTONES_3D.forEach((m) => {
      const tex = createBillboardTexture(m);
      if (!tex) return;

      const isFinal = m.side === "center";
      const bbGeom = new THREE.PlaneGeometry(isFinal ? 34 : 26, isFinal ? 17 : 13);
      const bbMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const bbMesh = new THREE.Mesh(bbGeom, bbMat);

      const pt = highwayCurve.getPointAt(m.t);
      const tangent = highwayCurve.getTangentAt(m.t).normalize();
      const binormal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();

      // Increased clearance so billboards stay 100% inside viewport without clipping
      let offsetDist = 26;
      if (m.side === "left") offsetDist = -26;
      if (m.side === "center") offsetDist = 0;

      const billboardPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, offsetDist);
      billboardPos.y += isFinal ? 10 : 7;

      bbMesh.position.copy(billboardPos);
      bbMesh.rotation.set(0, 0, 0);

      if (!isFinal) {
        const pillarGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(billboardPos.x, billboardPos.y - 6.5, billboardPos.z),
          new THREE.Vector3(billboardPos.x, pt.y, billboardPos.z),
        ]);
        const pillarMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(m.color),
          transparent: true,
          opacity: 0.6,
        });
        const pillar = new THREE.Line(pillarGeom, pillarMat);
        scene.add(pillar);
      }

      scene.add(bbMesh);
      billboardMeshes.push({ mesh: bbMesh, m });
    });

    const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambLight);

    let animationFrameId: number;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      // Smooth camera interpolation
      currentProgressRef.current = THREE.MathUtils.lerp(
        currentProgressRef.current,
        targetProgressRef.current,
        0.08
      );

      // Clamp progress so camera never scrolls into the void
      const t = Math.max(0.001, Math.min(0.985, currentProgressRef.current));

      const camPos = highwayCurve.getPointAt(t);
      const lookAtTarget = highwayCurve.getPointAt(Math.min(0.995, t + 0.04));

      camera.position.copy(camPos).add(new THREE.Vector3(0, 4.8, 0));
      camera.lookAt(lookAtTarget.x, lookAtTarget.y + 4.2, lookAtTarget.z);

      // Billboards smoothly orient towards camera
      billboardMeshes.forEach(({ mesh }) => {
        mesh.lookAt(camera.position.x, mesh.position.y, camera.position.z);
      });

      // Animate celebration cubes
      if (t > 0.85) {
        cubes.forEach(({ mesh, rotSpeed, initialY }) => {
          mesh.rotation.x += rotSpeed.x;
          mesh.rotation.y += rotSpeed.y;
          mesh.position.y = initialY + Math.sin(Date.now() * 0.003 + mesh.position.x) * 2;
        });

        if (t > 0.94 && !celebrationFiredRef.current) {
          celebrationFiredRef.current = true;
          triggerCelebration();
        }
      } else {
        celebrationFiredRef.current = false;
      }

      particles.rotation.y += 0.0006;
      renderer.render(scene, camera);
    };

    renderLoop();

    // Wheel event handler with smooth finish clamp
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.0004;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + delta));

      const curT = targetProgressRef.current;
      let closestIdx = 0;
      let minDiff = 999;
      MILESTONES_3D.forEach((m, idx) => {
        const diff = Math.abs(m.t - curT);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveMilestoneIndex(closestIdx);
    };

    // Touch & Drag Controls
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastYRef.current = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = lastYRef.current - e.clientY;
      lastYRef.current = e.clientY;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + deltaY * 0.0015));

      const curT = targetProgressRef.current;
      let closestIdx = 0;
      let minDiff = 999;
      MILESTONES_3D.forEach((m, idx) => {
        const diff = Math.abs(m.t - curT);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveMilestoneIndex(closestIdx);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaY = lastYRef.current - e.touches[0].clientY;
      lastYRef.current = e.touches[0].clientY;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + deltaY * 0.002));

      const curT = targetProgressRef.current;
      let closestIdx = 0;
      let minDiff = 999;
      MILESTONES_3D.forEach((m, idx) => {
        const diff = Math.abs(m.t - curT);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveMilestoneIndex(closestIdx);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 750;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [createBillboardTexture, createGantryTexture, triggerCelebration]);

  const jumpToMilestone = (index: number) => {
    soundFX.playClick();
    const m = MILESTONES_3D[index];
    if (m) {
      targetProgressRef.current = m.t;
      setActiveMilestoneIndex(index);
      if (index === MILESTONES_3D.length - 1) {
        triggerCelebration();
      }
    }
  };

  const activeMilestone = MILESTONES_3D[activeMilestoneIndex] || MILESTONES_3D[0];
  const isFinalMilestone = activeMilestoneIndex === MILESTONES_3D.length - 1;

  return (
    <div className="relative w-full select-none">
      {/* 2-Column Responsive Grid: Main 3D Viewport on Left (Wide & Expanded), Telemetry Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">

        {/* Left Column: 3D Highway Viewport (Expanded / Much Wider - lg:col-span-8 xl:col-span-9) */}
        <div className="lg:col-span-8 xl:col-span-9 relative min-h-[520px] sm:min-h-[620px] lg:min-h-[760px] rounded-2xl overflow-hidden border border-white/15 bg-[#050507] shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-between">
          {/* Three.js Canvas Container */}
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />

          {/* Top Header HUD Bar */}
          <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 border border-[#ccff00]/40 backdrop-blur-md text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="text-zinc-400 hidden sm:inline">ARENA:</span>
              <span className="text-[#ccff00] font-bold">{activeMilestone.phaseTitle.split(":")[0]}</span>
            </div>

            {/* Phase Quick Jump Pills */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-black/85 border border-white/15 p-1 rounded-full backdrop-blur-md text-[11px] font-mono">
              <button
                onClick={() => jumpToMilestone(0)}
                className="px-3 py-1 rounded-full text-[#ccff00] hover:bg-[#ccff00]/20 transition-all font-bold cursor-pointer"
              >
                PHASE 1
              </button>
              <button
                onClick={() => jumpToMilestone(3)}
                className="px-3 py-1 rounded-full text-cyan-300 hover:bg-cyan-500/20 transition-all font-bold cursor-pointer"
              >
                PHASE 2
              </button>
              <button
                onClick={() => jumpToMilestone(5)}
                className="px-3 py-1 rounded-full text-amber-300 hover:bg-amber-500/20 transition-all font-bold cursor-pointer"
              >
                PHASE 3
              </button>
            </div>
          </div>

          {/* Bottom HUD Controls on Canvas */}
          <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] bg-black/80 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm pointer-events-auto">
              <Compass className="w-3.5 h-3.5 text-[#ccff00] animate-spin" style={{ animationDuration: "10s" }} />
              <span className="hidden sm:inline">SCROLL / DRAG HIGHWAY</span>
              <span className="sm:hidden">DRAG ROAD</span>
            </div>

            {/* Previous / Next buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  soundFX.playClick();
                  jumpToMilestone(Math.max(0, activeMilestoneIndex - 1));
                }}
                disabled={activeMilestoneIndex === 0}
                className="p-2.5 sm:p-3 rounded-xl bg-black/85 border border-white/20 hover:border-[#ccff00] text-white disabled:opacity-30 transition-all cursor-pointer shadow-lg"
                title="Previous Milestone"
              >
                <ChevronLeft className="w-4 h-4 text-[#ccff00]" />
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  jumpToMilestone(Math.min(MILESTONES_3D.length - 1, activeMilestoneIndex + 1));
                }}
                disabled={activeMilestoneIndex === MILESTONES_3D.length - 1}
                className="p-2.5 sm:p-3 rounded-xl bg-black/85 border border-white/20 hover:border-[#ccff00] text-white disabled:opacity-30 transition-all cursor-pointer shadow-lg"
                title="Next Milestone"
              >
                <ChevronRight className="w-4 h-4 text-[#ccff00]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Detail Box (Keep As Is, Compact on Right - lg:col-span-4 xl:col-span-3) */}
        <div className="lg:col-span-4 xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-[#090b10]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping" />
              <span className="font-mono text-xs text-[#ccff00] font-bold uppercase tracking-wider">
                CHECKPOINT [{activeMilestoneIndex + 1} / {MILESTONES_3D.length}]
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/10 text-zinc-300 font-bold uppercase tracking-wider border border-white/10">
              {activeMilestone.tag}
            </span>
          </div>

          {/* Glowing Date Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ccff00]/15 border border-[#ccff00]/60 text-white font-[family-name:var(--font-orbitron)] font-black text-sm sm:text-base shadow-[0_0_20px_rgba(204,255,0,0.25)] self-start">
            <Calendar className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>{activeMilestone.date}</span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h3 className="font-[family-name:var(--font-orbitron)] font-black text-lg sm:text-xl xl:text-2xl text-white leading-tight">
              {activeMilestone.title}
            </h3>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-[#ccff00] mt-1 tracking-wide">
              {activeMilestone.subtitle}
            </div>
          </div>

          {/* Description */}
          <p className="font-mono text-xs text-zinc-400 leading-relaxed">
            {activeMilestone.description}
          </p>

          {/* Schedule / Fee / Winner Prize Details */}
          {isFinalMilestone ? (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>PRIZE POOL</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 rounded-lg bg-black/70 border border-amber-400/30">
                  <div className="text-[9px] text-zinc-400 uppercase">1ST (WINNER)</div>
                  <div className="text-base font-black text-[#ccff00] mt-0.5">₹20,000</div>
                </div>
                <div className="p-2 rounded-lg bg-black/70 border border-amber-400/30">
                  <div className="text-[9px] text-zinc-400 uppercase">2ND (RUNNER-UP)</div>
                  <div className="text-base font-black text-amber-300 mt-0.5">₹10,000</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="text-zinc-500 text-[10px]">TIME:</span>
                <span className="font-bold text-white text-xs">{activeMilestone.time}</span>
              </div>
              {activeMilestone.fee && (
                <div className="flex items-center gap-1 text-zinc-300 pl-2.5 border-l border-white/10">
                  <span className="text-zinc-500 text-[10px]">FEE:</span>
                  <span className="font-black text-[#ccff00] text-xs">{activeMilestone.fee}</span>
                </div>
              )}
            </div>
          )}

          {/* Stage Quick Jump Grid (N-01 to N-08) */}
          <div className="pt-2.5 border-t border-white/10 space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              STAGE NAVIGATOR:
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {MILESTONES_3D.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => jumpToMilestone(idx)}
                  onMouseEnter={() => soundFX.playHover()}
                  className={`py-1.5 sm:py-2 px-1 rounded-lg text-center font-mono text-[11px] font-bold border transition-all cursor-pointer ${activeMilestoneIndex === idx
                      ? "bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.4)] scale-105"
                      : "bg-black/50 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                >
                  N-0{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
