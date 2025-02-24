"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function FloatingBubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajuste o tamanho do canvas para cobrir toda a tela
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();

    interface Bubble {
      x: number;
      y: number;
      radius: number;
      speed: number;
      color: string;
    }

    const bubbles: Bubble[] = [];

    // Create initial bubbles
    const colors = [
      "hsla(60, 100%, 50%, 0.2)", // amarelo
      "hsla(120, 100%, 35%, 0.2)", // verde
      "hsla(0, 100%, 50%, 0.2)", // vermelho
      "hsla(0, 0%, 0%, 0.2)", // preto
    ];

    for (let i = 0; i < 50; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((bubble) => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();

        bubble.y -= bubble.speed;
        if (bubble.y + bubble.radius < 0) {
          bubble.y = canvas.height + bubble.radius;
          bubble.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.7, // Aumentando um pouco a visibilidade
      }}
    />
  );
}
