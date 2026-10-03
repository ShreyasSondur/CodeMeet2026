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
  Sparkles,
  Trophy,
  Award,
  Clock,
  Crown,
  MoveHorizontal,
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
    description: "Final deadline for Round 1 online registration and idea prototype submissions.",
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
  const [highwayProgressPercent, setHighwayProgressPercent] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastYRef = useRef(0);
  const lastXRef = useRef(0);
  const celebrationFiredRef = useRef(false);

  // Trigger celebration confetti
  const triggerCelebration = useCallback(() => {
    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#ccff00", "#00f0ff", "#f59e0b", "#ffffff"],
      });
    } catch {
      // ignore
    }
  }, []);

  // Generate Billboard Canvas Texture (Crisp, High-Contrast)
  const createBillboardTexture = useCallback((m: Milestone3D) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark sleek gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, "#0b0f16");
    grad.addColorStop(1, "#040608");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle cyber grid
    ctx.strokeStyle = "rgba(204, 255, 0, 0.07)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Outer Glowing Border
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 996, 484);

    // Corner Reticles
    ctx.fillStyle = m.color;
    ctx.fillRect(14, 14, 36, 10);
    ctx.fillRect(14, 14, 10, 36);
    ctx.fillRect(974, 14, 36, 10);
    ctx.fillRect(1000, 14, 10, 36);
    ctx.fillRect(14, 488, 36, 10);
    ctx.fillRect(14, 462, 10, 36);
    ctx.fillRect(974, 488, 36, 10);
    ctx.fillRect(1000, 462, 10, 36);

    // Top Header Pill: Date & Tag
    ctx.fillStyle = "rgba(204, 255, 0, 0.12)";
    ctx.fillRect(35, 35, 954, 80);

    // Date
    ctx.fillStyle = m.color;
    ctx.font = "900 42px 'Orbitron', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(m.date, 55, 88);

    // Tag & Time Pill
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`[ ${m.tag} • ${m.time} ]`, 965, 85);

    // Title
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px 'Orbitron', sans-serif";
    ctx.fillText(m.title, 55, 185);

    // Subtitle
    ctx.fillStyle = m.color;
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.fillText(m.subtitle, 55, 230);

    // Description text (word wrap)
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "24px 'Inter', sans-serif";
    const words = m.description.split(" ");
    let line = "";
    let yPos = 285;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 910 && n > 0) {
        ctx.fillText(line, 55, yPos);
        line = words[n] + " ";
        yPos += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 55, yPos);

    // Prize or Fee Banner at bottom
    if (m.prize) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(35, 420, 954, 65);
      ctx.fillStyle = "#000000";
      ctx.font = "900 28px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`🏆 ${m.prize}`, 512, 462);
    } else if (m.fee) {
      ctx.fillStyle = "#ccff00";
      ctx.font = "900 28px 'Orbitron', monospace";
      ctx.fillText(`ENTRY FEE: ${m.fee}`, 55, 455);
    } else {
      ctx.fillStyle = "rgba(204, 255, 0, 0.7)";
      ctx.font = "20px 'Courier New', monospace";
      ctx.fillText("CODEMEET 2026 // SUIET HACKATHON ROADMAP", 55, 455);
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
    canvas.width = 1200;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(8, 12, 16, 0.96)";
    ctx.fillRect(0, 0, 1200, 300);

    ctx.strokeStyle = g.color;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1180, 280);

    ctx.strokeStyle = "rgba(204, 255, 0, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 1160, 260);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px 'Orbitron', sans-serif";
    ctx.fillText(g.title, 600, 140);

    ctx.fillStyle = g.color;
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText(g.subtitle, 600, 205);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.0055);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Track resources for complete memory cleanup
    const disposables: { dispose: () => void }[] = [];

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
    const numStripes = 28;
    const stripeSpacing = 0.58;
    const highwayGroup = new THREE.Group();

    const sampleCount = 600;
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
      disposables.push(stripeGeom);

      const isCenter = Math.abs(s - numStripes / 2) < 1.2;
      const isEdge = s === 0 || s === numStripes - 1;

      const stripeMat = new THREE.LineBasicMaterial({
        color: isCenter ? 0xccff00 : isEdge ? 0x00f0ff : 0x223344,
        transparent: true,
        opacity: isCenter ? 0.95 : isEdge ? 0.8 : 0.28,
        linewidth: isCenter || isEdge ? 2 : 1,
      });
      disposables.push(stripeMat);

      const stripeLine = new THREE.Line(stripeGeom, stripeMat);
      highwayGroup.add(stripeLine);
    }
    scene.add(highwayGroup);

    // Glowing Speed Beacons along the track
    const beaconCount = 50;
    const beaconGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    disposables.push(beaconGeom);

    for (let i = 0; i < beaconCount; i++) {
      const t = (i / beaconCount) * 0.95 + 0.02;
      const pt = highwayCurve.getPointAt(t);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xccff00 : 0x00f0ff,
        transparent: true,
        opacity: 0.85,
      });
      disposables.push(beaconMat);

      const beacon = new THREE.Mesh(beaconGeom, beaconMat);
      beacon.position.copy(pt).add(new THREE.Vector3(i % 2 === 0 ? -9 : 9, 0.4, 0));
      scene.add(beacon);
    }

    // Atmospheric Floating Cyber Particle Dust
    const particleCount = 750;
    const pGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 220;
      pPositions[i + 1] = Math.random() * 45 - 5;
      pPositions[i + 2] = -Math.random() * 1000;
    }
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    disposables.push(pGeom);

    const pMat = new THREE.PointsMaterial({
      color: 0xccff00,
      size: 1.6,
      transparent: true,
      opacity: 0.45,
    });
    disposables.push(pMat);

    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Phase Arch Gantries Over Highway
    PHASE_GANTRIES.forEach((g) => {
      const pt = highwayCurve.getPointAt(g.t);
      const tangent = highwayCurve.getTangentAt(g.t);
      const gantryTex = createGantryTexture(g);
      if (gantryTex) disposables.push(gantryTex);

      const gantryMat = new THREE.MeshBasicMaterial({
        map: gantryTex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      disposables.push(gantryMat);

      const gantryGeom = new THREE.PlaneGeometry(24, 6);
      disposables.push(gantryGeom);

      const gantryMesh = new THREE.Mesh(gantryGeom, gantryMat);
      gantryMesh.position.copy(pt).add(new THREE.Vector3(0, 7.5, 0));
      gantryMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.negate());
      scene.add(gantryMesh);

      const archFrameGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-12, -7.5, 0),
        new THREE.Vector3(-12, 3.5, 0),
        new THREE.Vector3(12, 3.5, 0),
        new THREE.Vector3(12, -7.5, 0),
      ]);
      disposables.push(archFrameGeom);

      const archFrameMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(g.color),
        linewidth: 3,
      });
      disposables.push(archFrameMat);

      const archFrame = new THREE.Line(archFrameGeom, archFrameMat);
      archFrame.position.copy(pt).add(new THREE.Vector3(0, 7.5, 0));
      archFrame.quaternion.copy(gantryMesh.quaternion);
      scene.add(archFrame);
    });

    // Final Celebration Floating Hologram Cubes at Finale Gate
    const cubes: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number }; initialY: number }[] = [];
    const cubeGeom = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    disposables.push(cubeGeom);

    const endPoint = highwayCurve.getPointAt(0.98);
    for (let c = 0; c < 12; c++) {
      const cubeMat = new THREE.MeshBasicMaterial({
        color: c % 3 === 0 ? 0xccff00 : c % 3 === 1 ? 0x00f0ff : 0xf59e0b,
        wireframe: true,
      });
      disposables.push(cubeMat);

      const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
      const angle = (c / 12) * Math.PI * 2;
      const radius = 16;
      cubeMesh.position.set(
        endPoint.x + Math.cos(angle) * radius,
        endPoint.y + 6 + (c % 3) * 2.5,
        endPoint.z + Math.sin(angle) * 8
      );
      scene.add(cubeMesh);
      cubes.push({
        mesh: cubeMesh,
        rotSpeed: { x: (Math.random() - 0.5) * 0.03, y: (Math.random() - 0.5) * 0.03 },
        initialY: cubeMesh.position.y,
      });
    }

    // Billboards along Highway for all 8 Milestones
    const billboardMeshes: { mesh: THREE.Mesh; m: Milestone3D }[] = [];
    MILESTONES_3D.forEach((m) => {
      const pt = highwayCurve.getPointAt(m.t);
      const frenetIndex = Math.min(sampleCount, Math.floor(m.t * sampleCount));
      const binormal = frenetFrames.binormals[frenetIndex] || new THREE.Vector3(1, 0, 0);

      const billboardTex = createBillboardTexture(m);
      if (billboardTex) disposables.push(billboardTex);

      const bbMat = new THREE.MeshBasicMaterial({
        map: billboardTex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      disposables.push(bbMat);

      const bbGeom = new THREE.PlaneGeometry(16, 8);
      disposables.push(bbGeom);

      const bbMesh = new THREE.Mesh(bbGeom, bbMat);

      const offsetDist = m.side === "left" ? -14 : m.side === "right" ? 14 : 0;
      const yOffset = m.side === "center" ? 9 : 6.5;

      const billboardPos = new THREE.Vector3()
        .copy(pt)
        .addScaledVector(binormal, offsetDist)
        .add(new THREE.Vector3(0, yOffset, 0));

      bbMesh.position.copy(billboardPos);

      // Support Pillar from ground to billboard
      if (m.side !== "center") {
        const pillarGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(billboardPos.x, pt.y - 1, billboardPos.z),
          new THREE.Vector3(billboardPos.x, pt.y + 2.5, billboardPos.z),
        ]);
        disposables.push(pillarGeom);

        const pillarMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(m.color),
          transparent: true,
          opacity: 0.6,
        });
        disposables.push(pillarMat);

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
      setHighwayProgressPercent(Math.round((t / 0.985) * 100));

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

    const updateActiveMilestone = (curT: number) => {
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

    // Wheel event handler (Desktop mouse wheel inside canvas)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY * 0.0004;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + delta));
      updateActiveMilestone(targetProgressRef.current);
    };

    // Mouse Drag Controls (Desktop)
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastYRef.current = e.clientY;
      lastXRef.current = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = lastYRef.current - e.clientY;
      const deltaX = lastXRef.current - e.clientX;
      lastYRef.current = e.clientY;
      lastXRef.current = e.clientX;
      const dragDelta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + dragDelta * 0.0016));
      updateActiveMilestone(targetProgressRef.current);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Mobile Touch Drag Controls - 100% ISOLATED (Does NOT scroll outer web page)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastYRef.current = e.touches[0].clientY;
        lastXRef.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      if (e.cancelable) {
        e.preventDefault(); // Stop outer page scroll!
      }
      e.stopPropagation();

      const touch = e.touches[0];
      const deltaY = lastYRef.current - touch.clientY;
      const deltaX = lastXRef.current - touch.clientX;
      lastYRef.current = touch.clientY;
      lastXRef.current = touch.clientX;

      // Both vertical and horizontal swipes move the 3D timeline cleanly
      const dragDelta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
      targetProgressRef.current = Math.max(0, Math.min(0.985, targetProgressRef.current + dragDelta * 0.0022));
      updateActiveMilestone(targetProgressRef.current);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Attach canvas-level isolated event listeners with non-passive flags
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
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
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      // Cleanly dispose Three.js scene & WebGL memory to avoid GPU context leaks
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      });
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

        {/* Left Column: 3D Highway Viewport */}
        <div className="lg:col-span-8 xl:col-span-9 relative min-h-[460px] sm:min-h-[580px] lg:min-h-[760px] rounded-2xl overflow-hidden border border-white/15 bg-[#050507] shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-between">
          
          {/* Three.js Canvas Container with isolated touch-action */}
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full touch-none select-none overscroll-contain"
            style={{ touchAction: "none" }}
          />

          {/* Top Progress Bar across Highway */}
          <div className="relative z-20 w-full bg-black/60 h-1 border-b border-white/10 pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-[#ccff00] via-[#00f0ff] to-[#f59e0b] transition-all duration-150"
              style={{ width: `${Math.min(100, Math.max(2, highwayProgressPercent))}%` }}
            />
          </div>

          {/* Top Header HUD Bar */}
          <div className="relative z-20 p-3.5 sm:p-5 flex items-center justify-between pointer-events-none gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/85 border border-[#ccff00]/40 backdrop-blur-md text-[11px] sm:text-xs font-mono shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="text-zinc-400 hidden sm:inline">ARENA:</span>
              <span className="text-[#ccff00] font-bold">{activeMilestone.phaseTitle.split(":")[0]}</span>
            </div>

            {/* Phase Quick Jump Pills */}
            <div className="pointer-events-auto flex items-center gap-1 bg-black/85 border border-white/15 p-1 rounded-full backdrop-blur-md text-[10px] sm:text-[11px] font-mono">
              <button
                type="button"
                onClick={() => jumpToMilestone(0)}
                className="px-2.5 sm:px-3 py-1 rounded-full text-[#ccff00] hover:bg-[#ccff00]/20 transition-all font-bold cursor-pointer"
              >
                P-1
              </button>
              <button
                type="button"
                onClick={() => jumpToMilestone(3)}
                className="px-2.5 sm:px-3 py-1 rounded-full text-cyan-300 hover:bg-cyan-500/20 transition-all font-bold cursor-pointer"
              >
                P-2
              </button>
              <button
                type="button"
                onClick={() => jumpToMilestone(5)}
                className="px-2.5 sm:px-3 py-1 rounded-full text-amber-300 hover:bg-amber-500/20 transition-all font-bold cursor-pointer"
              >
                P-3
              </button>
            </div>
          </div>

          {/* Center Mobile Touch Helper Badge */}
          <div className="relative z-10 flex justify-center pointer-events-none my-auto">
            <div className="sm:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-[#ccff00]/40 text-[#ccff00] text-[10px] font-mono backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <MoveHorizontal className="w-3 h-3 text-[#ccff00]" />
              <span>SWIPE CANVAS TO DRIVE HIGHWAY</span>
            </div>
          </div>

          {/* Bottom HUD Controls on Canvas */}
          <div className="relative z-20 p-3.5 sm:p-5 flex items-center justify-between pointer-events-none gap-2">
            <div className="flex items-center gap-2 text-zinc-300 font-mono text-[10px] sm:text-[11px] bg-black/85 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm pointer-events-auto">
              <Compass className="w-3.5 h-3.5 text-[#ccff00] animate-spin" style={{ animationDuration: "10s" }} />
              <span className="hidden sm:inline">SWIPE / DRAG 3D ROAD</span>
              <span className="sm:hidden font-bold text-white">{highwayProgressPercent}% ROAD</span>
            </div>

            {/* Previous / Next buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  jumpToMilestone(Math.max(0, activeMilestoneIndex - 1));
                }}
                disabled={activeMilestoneIndex === 0}
                className="p-2.5 sm:p-3 rounded-xl bg-black/90 border border-white/20 hover:border-[#ccff00] text-white disabled:opacity-30 transition-all cursor-pointer shadow-lg active:scale-95"
                title="Previous Milestone"
                aria-label="Previous Milestone"
              >
                <ChevronLeft className="w-4 h-4 text-[#ccff00]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  jumpToMilestone(Math.min(MILESTONES_3D.length - 1, activeMilestoneIndex + 1));
                }}
                disabled={activeMilestoneIndex === MILESTONES_3D.length - 1}
                className="p-2.5 sm:p-3 rounded-xl bg-black/90 border border-white/20 hover:border-[#ccff00] text-white disabled:opacity-30 transition-all cursor-pointer shadow-lg active:scale-95"
                title="Next Milestone"
                aria-label="Next Milestone"
              >
                <ChevronRight className="w-4 h-4 text-[#ccff00]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Detail Box */}
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
          <p className="font-mono text-xs text-zinc-300 leading-relaxed">
            {activeMilestone.description}
          </p>

          {/* Schedule / Fee / Winner Prize Details */}
          {isFinalMilestone ? (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/50 space-y-2 font-mono text-xs">
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
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
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
                  type="button"
                  onClick={() => jumpToMilestone(idx)}
                  onMouseEnter={() => soundFX.playHover()}
                  className={`py-1.5 sm:py-2 px-1 rounded-lg text-center font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                    activeMilestoneIndex === idx
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
