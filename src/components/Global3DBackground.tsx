import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { checkWebGLSupport } from '../utils/webgl';

export const Global3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Verify WebGL support
    if (!checkWebGLSupport()) {
      setUseFallback(true);
      return;
    }

    const isMobile = window.innerWidth < 768;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isCleanedUp = false;
    let isTabVisible = true;

    // Geometries & materials to dispose
    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const registerDisposable = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(item: T): T => {
      disposables.push(item);
      return item;
    };

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        precision: 'highp',
      });

      const domElement = renderer.domElement;
      domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('WebGL context lost, switching to continuous 2D fallback.');
        setUseFallback(true);
      });

      const getOptimalPixelRatio = (width: number, height: number) => {
        const is8K = width >= 5120 || height >= 2880;
        const is4K = width >= 2560 || height >= 1440;
        // On 8K screens, 1.0 - 1.25 DPR renders at up to 9600x5400 which is pristine without GPU memory overflow
        const maxDpr = isMobile ? 1.0 : is8K ? 1.25 : is4K ? 2.0 : 1.75;
        return Math.min(window.devicePixelRatio || 1, maxDpr);
      };

      const updateRendererSize = () => {
        if (!renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(getOptimalPixelRatio(width, height));
      };

      updateRendererSize();
      container.appendChild(domElement);

      const scene = new THREE.Scene();
      // Subtle cyber fog to merge background seamlessly into `#0D0D14`
      scene.fog = new THREE.FogExp2(0x0D0D14, 0.026);

      const camera = new THREE.PerspectiveCamera(
        52,
        window.innerWidth / window.innerHeight,
        0.1,
        140
      );
      camera.position.set(0, 0, isMobile ? 8.2 : 7.2);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0x08130d, 2.8);
      scene.add(ambientLight);

      // Main kinetic green light that follows camera scroll path
      const mainLight = new THREE.PointLight(0x8B5CF6, 4.0, 45);
      mainLight.position.set(4, 5, 4);
      scene.add(mainLight);

      // Secondary cool emerald rim light
      const rimLight = new THREE.PointLight(0x059669, 3.2, 40);
      rimLight.position.set(-5, -4, 3);
      scene.add(rimLight);

      // Tertiary teal accent light
      const tealLight = new THREE.PointLight(0x22D3EE, 2.2, 35);
      tealLight.position.set(3, -15, 2);
      scene.add(tealLight);

      // --- WORLD ROOT GROUP ---
      const worldGroup = new THREE.Group();
      scene.add(worldGroup);

      // -------------------------------------------------------------
      // 1. ZONE 1: HERO LEVEL (Y = 0 to -3)
      // -------------------------------------------------------------
      const heroGroup = new THREE.Group();
      heroGroup.position.set(0, 0, 0);
      worldGroup.add(heroGroup);

      // Core faceted icosahedron
      const coreGeo = registerDisposable(new THREE.IcosahedronGeometry(isMobile ? 1.5 : 1.9, 1));
      const coreMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x091e13,
          emissive: 0x052e16,
          emissiveIntensity: 0.45,
          roughness: 0.35,
          metalness: 0.85,
        })
      );
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      heroGroup.add(coreMesh);

      // Wireframe overlay shell
      const wireMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: 0x8B5CF6,
          wireframe: true,
          transparent: true,
          opacity: 0.38,
        })
      );
      const wireMesh = new THREE.Mesh(coreGeo, wireMat);
      wireMesh.scale.setScalar(1.025);
      coreMesh.add(wireMesh);

      // Orbital Rings for Hero Core
      const torusGeo1 = registerDisposable(
        new THREE.TorusGeometry(isMobile ? 2.3 : 3.0, 0.05, 12, isMobile ? 32 : 54)
      );
      const torusMat1 = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x8B5CF6,
          emissive: 0x8B5CF6,
          emissiveIntensity: 0.6,
        })
      );
      const torusMesh1 = new THREE.Mesh(torusGeo1, torusMat1);
      torusMesh1.rotation.x = Math.PI / 3;
      heroGroup.add(torusMesh1);

      const torusGeo2 = registerDisposable(
        new THREE.TorusGeometry(isMobile ? 2.9 : 3.8, 0.03, 8, isMobile ? 24 : 44)
      );
      const torusMat2 = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: 0x22D3EE,
          wireframe: true,
          transparent: true,
          opacity: 0.38,
        })
      );
      const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
      torusMesh2.rotation.y = Math.PI / 4;
      heroGroup.add(torusMesh2);

      // -------------------------------------------------------------
      // 2. ZONE 2: ABOUT & SERVICES LEVEL (Y = -6 to -10)
      // -------------------------------------------------------------
      const servicesGroup = new THREE.Group();
      servicesGroup.position.set(0, -7.5, 0);
      worldGroup.add(servicesGroup);

      // Floating Crystalline Dodecahedron on the left flank
      const dodecaGeo = registerDisposable(new THREE.DodecahedronGeometry(isMobile ? 1.0 : 1.4, 0));
      const dodecaMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x072216,
          emissive: 0x064e3b,
          emissiveIntensity: 0.5,
          roughness: 0.25,
          metalness: 0.8,
        })
      );
      const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
      dodecaMesh.position.set(isMobile ? -2.2 : -4.2, 0.5, -1.5);
      servicesGroup.add(dodecaMesh);

      const dodecaWireMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: 0x8B5CF6,
          wireframe: true,
          transparent: true,
          opacity: 0.45,
        })
      );
      const dodecaWire = new THREE.Mesh(dodecaGeo, dodecaWireMat);
      dodecaWire.scale.setScalar(1.03);
      dodecaMesh.add(dodecaWire);

      // Floating Diamond Polyhedron on the right flank
      const rightOctaGeo = registerDisposable(new THREE.OctahedronGeometry(isMobile ? 0.9 : 1.3, 0));
      const rightOctaMesh = new THREE.Mesh(rightOctaGeo, dodecaMat);
      rightOctaMesh.position.set(isMobile ? 2.2 : 4.4, -0.8, -1.8);
      servicesGroup.add(rightOctaMesh);

      const rightOctaWire = new THREE.Mesh(rightOctaGeo, wireMat);
      rightOctaWire.scale.setScalar(1.03);
      rightOctaMesh.add(rightOctaWire);

      // -------------------------------------------------------------
      // 3. ZONE 3: PORTFOLIO & TESTIMONIALS LEVEL (Y = -14 to -18)
      // -------------------------------------------------------------
      const showcaseGroup = new THREE.Group();
      showcaseGroup.position.set(0, -15.5, 0);
      worldGroup.add(showcaseGroup);

      // Torus Knot Kinetic Sculpture
      const knotGeo = registerDisposable(
        new THREE.TorusKnotGeometry(isMobile ? 1.0 : 1.3, 0.18, isMobile ? 40 : 64, 10, 2, 3)
      );
      const knotMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x052e16,
          emissive: 0x8B5CF6,
          emissiveIntensity: 0.35,
          wireframe: true,
          roughness: 0.3,
        })
      );
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      knotMesh.position.set(isMobile ? 1.8 : 3.8, 0, -2);
      showcaseGroup.add(knotMesh);

      // Left floating icosahedron node
      const leftIcosaGeo = registerDisposable(new THREE.IcosahedronGeometry(isMobile ? 0.8 : 1.1, 0));
      const leftIcosaMesh = new THREE.Mesh(leftIcosaGeo, dodecaMat);
      leftIcosaMesh.position.set(isMobile ? -1.9 : -3.9, -0.5, -1.2);
      showcaseGroup.add(leftIcosaMesh);

      const leftIcosaWire = new THREE.Mesh(leftIcosaGeo, wireMat);
      leftIcosaWire.scale.setScalar(1.04);
      leftIcosaMesh.add(leftIcosaWire);

      // -------------------------------------------------------------
      // 4. ZONE 4: PRICING, BOOKING, CONTACT & FOOTER (Y = -22 to -28)
      // -------------------------------------------------------------
      const closingGroup = new THREE.Group();
      closingGroup.position.set(0, -23.5, 0);
      worldGroup.add(closingGroup);

      // Sleek rotating beacon ring
      const beaconRingGeo = registerDisposable(
        new THREE.TorusGeometry(isMobile ? 2.0 : 2.8, 0.05, 10, isMobile ? 28 : 48)
      );
      const beaconRingMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x8B5CF6,
          emissive: 0x8B5CF6,
          emissiveIntensity: 0.55,
        })
      );
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2.6;
      closingGroup.add(beaconRing);

      // Central diamond core in beacon
      const beaconCoreGeo = registerDisposable(new THREE.OctahedronGeometry(isMobile ? 0.8 : 1.1, 0));
      const beaconCore = new THREE.Mesh(beaconCoreGeo, coreMat);
      beaconRing.add(beaconCore);
      const beaconCoreWire = new THREE.Mesh(beaconCoreGeo, wireMat);
      beaconCoreWire.scale.setScalar(1.03);
      beaconCore.add(beaconCoreWire);

      // Floating Satellites Distributed Along the Whole Vertical Column
      const satelliteCount = isMobile ? 8 : 16;
      const floatingShapes: THREE.Mesh[] = [];
      const sharedSatGeo = registerDisposable(new THREE.OctahedronGeometry(0.35, 0));
      const satMat1 = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x8B5CF6,
          emissive: 0x064e3b,
          roughness: 0.3,
          metalness: 0.8,
        })
      );
      const satMat2 = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x059669,
          emissive: 0x043528,
          roughness: 0.4,
          metalness: 0.7,
        })
      );

      for (let i = 0; i < satelliteCount; i++) {
        const mesh = new THREE.Mesh(sharedSatGeo, i % 2 === 0 ? satMat1 : satMat2);
        const yPos = -((i / satelliteCount) * 27) + 2.5; // span from +2.5 down to -25
        const angle = i * 1.35;
        const radius = (isMobile ? 2.5 : 4.0) + (i % 3) * 1.1;

        mesh.position.set(
          Math.cos(angle) * radius,
          yPos,
          Math.sin(angle) * 2.5 - 1
        );

        mesh.userData = {
          rotSpeedX: 0.005 + (i % 4) * 0.003,
          rotSpeedY: 0.008 + (i % 3) * 0.004,
          origY: yPos,
          floatFreq: 0.8 + (i % 5) * 0.3,
          floatAmp: 0.25 + (i % 3) * 0.1,
        };

        worldGroup.add(mesh);
        floatingShapes.push(mesh);
      }

      // -------------------------------------------------------------
      // 5. CONTINUOUS FULL-HEIGHT PARTICLE FIELD (STARDUST)
      // -------------------------------------------------------------
      const particleCount = isMobile ? 120 : 380;
      const particleGeo = registerDisposable(new THREE.BufferGeometry());
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        // Spread particles across the entire height of the scroll journey
        posArray[i] = (Math.random() - 0.5) * (isMobile ? 18 : 28);
        posArray[i + 1] = Math.random() * 8 - 32; // from +8 down to -24
        posArray[i + 2] = (Math.random() - 0.5) * 18 - 2;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = registerDisposable(
        new THREE.PointsMaterial({
          size: isMobile ? 0.045 : 0.055,
          color: 0x8B5CF6,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
        })
      );
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // --- MOUSE & SCROLL STATE ---
      let targetMouseX = 0;
      let targetMouseY = 0;
      let curMouseX = 0;
      let curMouseY = 0;

      let targetScrollProgress = 0;
      let curScrollProgress = 0;

      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        targetScrollProgress = totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
      };

      // Initial read
      handleScroll();

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });

      const handleResize = () => {
        if (!renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(getOptimalPixelRatio(width, height));
      };

      window.addEventListener('resize', handleResize);

      const handleVisibilityChange = () => {
        isTabVisible = document.visibilityState === 'visible';
        if (isTabVisible) {
          clock.getDelta(); // reset delta
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // -------------------------------------------------------------
      // RENDER LOOP
      // -------------------------------------------------------------
      const TOTAL_VERTICAL_TRAVEL = 24.5; // distance camera travels from Hero to Footer

      const animate = () => {
        if (isCleanedUp) return;
        animationFrameId = requestAnimationFrame(animate);

        if (!isTabVisible) return;

        const elapsedTime = clock.getElapsedTime();

        // Smooth Lerp for Mouse
        curMouseX += (targetMouseX - curMouseX) * 0.045;
        curMouseY += (targetMouseY - curMouseY) * 0.045;

        // Smooth Lerp for Scroll Progression
        curScrollProgress += (targetScrollProgress - curScrollProgress) * 0.055;

        // Dynamic Camera Position that smoothly travels down through the 3D universe
        const targetCamY = -curScrollProgress * TOTAL_VERTICAL_TRAVEL;
        camera.position.y = targetCamY + curMouseY * 0.35;
        camera.position.x = curMouseX * 0.5 + Math.sin(curScrollProgress * Math.PI) * 0.4;

        // Move PointLights along with camera so each section is dynamically illuminated
        mainLight.position.y = targetCamY + 4;
        mainLight.position.x = 4 + Math.sin(elapsedTime * 0.5) * 2;
        rimLight.position.y = targetCamY - 4;
        tealLight.position.y = targetCamY - 8;

        // Dynamic Rotations
        // Hero core
        coreMesh.rotation.y = elapsedTime * 0.2 + curMouseX * 0.3;
        coreMesh.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 - curMouseY * 0.2;
        torusMesh1.rotation.z += 0.007;
        torusMesh2.rotation.x += 0.005;

        // Services elements
        dodecaMesh.rotation.y = elapsedTime * 0.25;
        dodecaMesh.rotation.x = elapsedTime * 0.15;
        rightOctaMesh.rotation.y = -elapsedTime * 0.22;
        rightOctaMesh.rotation.z = elapsedTime * 0.18;

        // Showcase knot
        knotMesh.rotation.x = elapsedTime * 0.3;
        knotMesh.rotation.y = elapsedTime * 0.2;
        leftIcosaMesh.rotation.x = elapsedTime * 0.18;
        leftIcosaMesh.rotation.y = elapsedTime * 0.22;

        // Closing beacon
        beaconRing.rotation.z = elapsedTime * 0.25;
        beaconCore.rotation.y = -elapsedTime * 0.35;

        // Satellites orbiting & floating
        floatingShapes.forEach((shape) => {
          shape.rotation.x += shape.userData.rotSpeedX;
          shape.rotation.y += shape.userData.rotSpeedY;
          shape.position.y =
            shape.userData.origY +
            Math.sin(elapsedTime * shape.userData.floatFreq) * shape.userData.floatAmp;
        });

        // Gentle cosmic drift for particles
        particles.rotation.y = elapsedTime * 0.018;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isCleanedUp = true;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cancelAnimationFrame(animationFrameId);

        disposables.forEach((item) => {
          try {
            item.dispose();
          } catch {
            // ignore
          }
        });

        renderer.dispose();
        if (domElement && container.contains(domElement)) {
          container.removeChild(domElement);
        }
      };
    } catch (err) {
      console.warn('Failed to initialize Global 3D WebGL background:', err);
      setUseFallback(true);
    }
  }, []);

  // -------------------------------------------------------------
  // CONTINUOUS 2D FALLBACK (When WebGL is unavailable or lost)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!useFallback) return;

    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    const onResize = () => {
      setupCanvasSize();
    };
    window.addEventListener('resize', onResize);

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 35 : 75;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let scrollProgress = 0;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy - scrollProgress * 0.2; // scroll parallax

        if (n1.x < 0) n1.x = width;
        if (n1.x > width) n1.x = 0;
        if (n1.y < 0) n1.y = height;
        if (n1.y > height) n1.y = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 110) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(139, 92, 246, ${n1.alpha})`;
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [useFallback]);

  return (
    <div
      ref={containerRef}
      id="global-3d-background"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft Vignette Overlay to guarantee 100% crisp typography readability across all sections */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0D0D14]/45 to-[#0D0D14]/85 pointer-events-none z-1" />

      {useFallback && (
        <canvas
          ref={fallbackCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
      )}
    </div>
  );
};
