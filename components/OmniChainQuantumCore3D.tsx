import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface OmniChainQuantumCore3DProps {
  tps?: number;
  pulseTrigger?: number;
  activeChain?: string;
}

export const OmniChainQuantumCore3D: React.FC<OmniChainQuantumCore3DProps> = ({
  tps = 428500,
  pulseTrigger = 0,
  activeChain = 'TON'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(pulseTrigger);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pulseRef.current = pulseTrigger;
  }, [pulseTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 220;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. Lighting Rig (Stainless Steel Speculars + Neon Glow)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe2e8f0, 3.5); // Platinum white highlight
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 2.0);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    // Neon Cyber Core Point Lights
    const cyanPoint = new THREE.PointLight(0x00f0ff, 4.0, 12);
    cyanPoint.position.set(0, 0, 0);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 3.0, 10);
    purplePoint.position.set(3, 2, 2);
    scene.add(purplePoint);

    // 4. Stainless Steel Master Quantum Core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Brushed Stainless Steel Solid Sphere
    const innerSphereGeo = new THREE.SphereGeometry(1.25, 48, 48);
    const stainlessSteelMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.96,
      roughness: 0.15,
      wireframe: false
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, stainlessSteelMat);
    coreGroup.add(innerSphere);

    // Stainless Steel Geodesic Exoskeleton Lattice
    const outerLatticeGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.1,
      wireframe: true
    });
    const latticeMesh = new THREE.Mesh(outerLatticeGeo, latticeMat);
    coreGroup.add(latticeMesh);

    // 5. Neon Holographic Orbit Rings (Chain Relays)
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.025, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Neon Cyan (TON)
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.35, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xa855f7 }); // Neon Purple (Solana)
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 2.8;
    ring2.rotation.z = Math.PI / 6;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(2.6, 0.025, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Quantum Green (Ethereum/L2)
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.y = Math.PI / 4;
    coreGroup.add(ring3);

    // 6. Cross-Chain Validator Node Satellites
    const chainColors = [0x00f0ff, 0xa855f7, 0x10b981, 0xf59e0b, 0xef4444, 0x3b82f6];
    const nodeCount = 6;
    const nodeMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: chainColors[i % chainColors.length],
        metalness: 0.8,
        roughness: 0.2,
        emissive: chainColors[i % chainColors.length],
        emissiveIntensity: 0.8
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      coreGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    }

    // 7. Transaction Data Particle Cloud (Representing billions of txs/day)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      // Color palette: Neon Cyan, Platinum White, Violet, Amber
      const colorChoice = Math.random();
      if (colorChoice > 0.6) {
        particleColors[i * 3] = 0.0;
        particleColors[i * 3 + 1] = 0.94;
        particleColors[i * 3 + 2] = 1.0; // Cyan
      } else if (colorChoice > 0.3) {
        particleColors[i * 3] = 0.65;
        particleColors[i * 3 + 1] = 0.33;
        particleColors[i * 3 + 2] = 0.96; // Purple
      } else {
        particleColors[i * 3] = 0.9;
        particleColors[i * 3 + 1] = 0.95;
        particleColors[i * 3 + 2] = 1.0; // Platinum
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    // 8. Touch / Drag Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 340;
      const newH = container.clientHeight || 220;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let prevPulse = pulseTrigger;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Check for swap pulse trigger
      if (pulseRef.current !== prevPulse) {
        prevPulse = pulseRef.current;
        // Boost core rotation & light on instant swap
        targetRotationRef.current.y += 0.8;
        cyanPoint.intensity = 8.0;
        setTimeout(() => {
          cyanPoint.intensity = 4.0;
        }, 600);
      }

      // Smooth damped rotation
      coreGroup.rotation.y += (targetRotationRef.current.y - coreGroup.rotation.y) * 0.05 + 0.006;
      coreGroup.rotation.x += (targetRotationRef.current.x - coreGroup.rotation.x) * 0.05;

      // Inner sphere subtle breathing
      const breath = 1 + Math.sin(elapsedTime * 2.5) * 0.02;
      innerSphere.scale.set(breath, breath, breath);

      // Lattice counter-rotation
      latticeMesh.rotation.y = -elapsedTime * 0.3;
      latticeMesh.rotation.z = elapsedTime * 0.2;

      // Orbiting rings
      ring1.rotation.z = elapsedTime * 0.8;
      ring2.rotation.x = -elapsedTime * 0.6;
      ring3.rotation.y = elapsedTime * 0.5;

      // Orbiting node positions
      nodeMeshes.forEach((node, idx) => {
        const offset = (idx * Math.PI * 2) / nodeCount;
        const orbitRadius = 2.45;
        const angle = elapsedTime * 0.7 + offset;
        node.position.x = Math.cos(angle) * orbitRadius;
        node.position.z = Math.sin(angle) * orbitRadius;
        node.position.y = Math.sin(elapsedTime * 1.5 + idx) * 0.5;
      });

      // Swirling particles
      particles.rotation.y = -elapsedTime * 0.15;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      innerSphereGeo.dispose();
      stainlessSteelMat.dispose();
      outerLatticeGeo.dispose();
      latticeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-black to-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center group cursor-grab active:cursor-grabbing">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Futuristic Stainless Steel & Holographic Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>QUANTUM OMNI-CORE</span>
        </div>
        <span className="bg-slate-900/80 backdrop-blur-md text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded-full text-[9px] font-mono">
          3D Live
        </span>
      </div>

      <div className="absolute top-3 right-3 text-right pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-slate-800 text-[10px] font-mono">
          <p className="text-slate-400 text-[9px]">Throughput Capacity</p>
          <p className="font-black text-emerald-400">1.48B Txns / Day</p>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[9px] font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">TPS: {tps.toLocaleString()}</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400">Latency: 0.0004s</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-white font-bold">{activeChain} Bridge Linked</span>
        </div>
      </div>
    </div>
  );
};

export default OmniChainQuantumCore3D;
