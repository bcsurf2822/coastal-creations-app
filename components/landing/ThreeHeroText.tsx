"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

interface ThreeScene {
  add: (object: unknown) => void;
}

interface ThreeCamera {
  position: { z: number };
  aspect: number;
  updateProjectionMatrix: () => void;
}

interface ThreeRenderer {
  domElement: HTMLCanvasElement;
  setPixelRatio: (value: number) => void;
  setSize: (width: number, height: number) => void;
  render: (scene: ThreeScene, camera: ThreeCamera) => void;
  dispose: () => void;
}

interface ThreeTexture {
  needsUpdate: boolean;
  dispose: () => void;
}

interface ThreeGeometry {
  dispose: () => void;
}

interface ThreeMaterial {
  opacity: number;
  dispose: () => void;
}

interface ThreeMesh {
  position: { x: number; y: number };
  rotation: { x: number };
}

interface ThreeModule {
  Scene: new () => ThreeScene;
  PerspectiveCamera: new (
    fov: number,
    aspect: number,
    near: number,
    far: number
  ) => ThreeCamera;
  WebGLRenderer: new (options: { alpha?: boolean; antialias?: boolean }) => ThreeRenderer;
  CanvasTexture: new (canvas: HTMLCanvasElement) => ThreeTexture;
  PlaneGeometry: new (width: number, height: number) => ThreeGeometry;
  MeshBasicMaterial: new (options: {
    map: ThreeTexture;
    transparent?: boolean;
    opacity?: number;
  }) => ThreeMaterial;
  Mesh: new (geometry: ThreeGeometry, material: ThreeMaterial) => ThreeMesh;
}

declare global {
  interface Window {
    THREE?: ThreeModule;
  }
}

let threeLoaderPromise: Promise<ThreeModule | null> | null = null;
const THREE_CDN_SOURCES = [
  "https://unpkg.com/three@0.161.0/build/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js",
];

const loadThreeScript = async (src: string): Promise<boolean> => {
  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[data-threejs-src="${src}"]`
  );

  const attachLoadListeners = (script: HTMLScriptElement): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const scriptState = script.dataset.loadState;
      if (scriptState === "loaded") {
        resolve(true);
        return;
      }
      if (scriptState === "failed") {
        resolve(false);
        return;
      }

      const handleLoad = (): void => {
        window.clearTimeout(timeoutId);
        script.dataset.loadState = window.THREE ? "loaded" : "failed";
        resolve(Boolean(window.THREE));
      };

      const handleError = (): void => {
        window.clearTimeout(timeoutId);
        script.dataset.loadState = "failed";
        resolve(false);
      };

      const timeoutId = window.setTimeout(() => {
        script.dataset.loadState = window.THREE ? "loaded" : "failed";
        resolve(Boolean(window.THREE));
      }, 5000);

      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
    });
  };

  if (existingScript) {
    return attachLoadListeners(existingScript);
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.dataset.threejsSrc = src;
  script.dataset.loadState = "pending";
  document.head.appendChild(script);

  return attachLoadListeners(script);
};

const loadThreeFromCdn = async (): Promise<ThreeModule | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.THREE) {
    return window.THREE;
  }

  if (!threeLoaderPromise) {
    threeLoaderPromise = (async (): Promise<ThreeModule | null> => {
      for (const source of THREE_CDN_SOURCES) {
        const loaded = await loadThreeScript(source);
        if (loaded && window.THREE) {
          return window.THREE;
        }
      }
      return null;
    })();
  }

  return threeLoaderPromise;
};

interface ThreeHeroTextProps {
  text: string;
  className?: string;
}

const drawTextTexture = (canvas: HTMLCanvasElement, text: string): void => {
  canvas.width = 2048;
  canvas.height = 700;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255,255,255,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(8, 38, 60, 0.2)";
  context.shadowBlur = 14;
  context.shadowOffsetY = 3;

  let fontSize = 136;
  let lines: string[] = [];
  const words = text.trim().split(/\s+/);
  const maxTextWidth = canvas.width * 0.86;

  while (fontSize >= 96) {
    context.font = `700 ${fontSize}px 'Abril Fatface', 'Times New Roman', serif`;
    lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(testLine).width <= maxTextWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length <= 2) {
      break;
    }

    fontSize -= 8;
  }

  if (lines.length > 2) {
    lines = [lines[0], lines.slice(1).join(" ")];
  }

  const finalLines = lines.length === 1 ? [lines[0], ""] : lines;
  const x = canvas.width / 2;
  const lineOneY = canvas.height * 0.4;
  const lineTwoY = canvas.height * 0.64;

  context.lineJoin = "round";
  context.lineWidth = 20;
  context.strokeStyle = "rgba(255, 255, 255, 0.9)";
  context.fillStyle = "#0f4f70";

  if (finalLines[0]) {
    context.strokeText(finalLines[0], x, lineOneY);
    context.fillText(finalLines[0], x, lineOneY);
  }

  if (finalLines[1]) {
    context.strokeText(finalLines[1], x, lineTwoY);
    context.fillText(finalLines[1], x, lineTwoY);
  }
};

const ThreeHeroText = ({ text, className = "" }: ThreeHeroTextProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasRenderError, setHasRenderError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let observer: IntersectionObserver | null = null;
    let disposeThreeResources: (() => void) | null = null;

    const setupScene = async (): Promise<void> => {
      try {
        const THREE = await loadThreeFromCdn();
        if (disposed || !container || !THREE) {
          if (!THREE) {
            setHasRenderError(true);
          }
          return;
        }

        const scene = new THREE.Scene();
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 4;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const textCanvas = document.createElement("canvas");
        drawTextTexture(textCanvas, text);

        const texture = new THREE.CanvasTexture(textCanvas);
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneGeometry(4.45, 1.56);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = -2.1;
        mesh.rotation.x = 0.3;
        scene.add(mesh);

        let isVisible = false;
        let animationStart: number | null = null;

        observer = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry?.isIntersecting) {
              isVisible = true;
              observer?.disconnect();
            }
          },
          { threshold: 0.45 }
        );
        observer.observe(container);

        const animate = (timestamp: number): void => {
          if (disposed) {
            return;
          }

          if (isVisible) {
            if (animationStart === null) {
              animationStart = timestamp;
            }

            const progress = Math.min((timestamp - animationStart) / 1300, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const revealY = -2.1 + 2.1 * eased;
            const floatY = progress >= 1 ? Math.sin(timestamp / 680) * 0.08 : 0;
            const floatX = progress >= 1 ? Math.sin(timestamp / 1030) * 0.06 : 0;
            mesh.position.y = revealY + floatY;
            mesh.position.x = floatX;
            mesh.rotation.x =
              0.3 * (1 - eased) + (progress >= 1 ? Math.sin(timestamp / 1400) * 0.014 : 0);
            material.opacity = eased;
          }

          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        };

        frameId = window.requestAnimationFrame(animate);

        resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) {
            return;
          }

          const nextWidth = Math.max(entry.contentRect.width, 1);
          const nextHeight = Math.max(entry.contentRect.height, 1);
          camera.aspect = nextWidth / nextHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(nextWidth, nextHeight);
        });
        resizeObserver.observe(container);

        disposeThreeResources = () => {
          geometry.dispose();
          material.dispose();
          texture.dispose();
          renderer.dispose();
        };
      } catch (error: unknown) {
        console.error("[ThreeHeroText-setupScene] Unable to initialize Three.js:", error);
        setHasRenderError(true);
      }
    };

    void setupScene();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      resizeObserver?.disconnect();
      disposeThreeResources?.();
    };
  }, [text]);

  if (hasRenderError) {
    return (
      <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight text-primary font-bold">
        {text}
      </h1>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-hidden />
      <h1 className="sr-only">{text}</h1>
    </div>
  );
};

export default ThreeHeroText;
