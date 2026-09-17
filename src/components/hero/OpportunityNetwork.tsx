"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SignalNode = {
  id: number;
  x: number; // 0-1 normalized
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  phase: number;
  isSignal: boolean;
  data?: { property: string; value: string; market: string; status: string };
};

const SIGNAL_DATA = [
  {
    property: "Single-Family · 3bd/2ba",
    value: "Equity gap detected",
    market: "Sun Belt metro",
    status: "Evaluating",
  },
  {
    property: "Multi-Family · 8 units",
    value: "Below-market basis",
    market: "Secondary market",
    status: "Under review",
  },
  {
    property: "Vacant Land · 2.4 ac",
    value: "Off-market lead",
    market: "Growth corridor",
    status: "Contacted",
  },
  {
    property: "Small Retail · Corner lot",
    value: "Motivated seller",
    market: "Infill district",
    status: "Structuring",
  },
];

function makeNodes(count: number): SignalNode[] {
  const nodes: SignalNode[] = [];
  const signalCount = Math.min(SIGNAL_DATA.length, 4);
  for (let i = 0; i < count; i++) {
    const x = Math.random();
    const y = Math.random();
    const isSignal = i < signalCount;
    nodes.push({
      id: i,
      x,
      y,
      baseX: x,
      baseY: y,
      r: isSignal ? 3.2 : 1.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      isSignal,
      data: isSignal ? SIGNAL_DATA[i] : undefined,
    });
  }
  return nodes;
}

export function OpportunityNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SignalNode[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const rafRef = useRef<number | undefined>(undefined);
  const [activeSignal, setActiveSignal] = useState<SignalNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !wrap) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const nodeCount = window.innerWidth < 768 ? 32 : 58;
    nodesRef.current = makeNodes(nodeCount);

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(wrap);

    function onResize() {
      resize();
    }
    window.addEventListener("resize", onResize);

    function onPointerMove(e: PointerEvent) {
      const rect = wrap!.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      };
    }
    function onPointerLeave() {
      mouseRef.current.active = false;
      setActiveSignal(null);
    }
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    let t = 0;
    const maxDist = 0.16;

    function draw() {
      if (!ctx) return;
      t += prefersReduced ? 0 : 0.006;
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // update positions with gentle drift
      for (const n of nodes) {
        if (!prefersReduced) {
          n.x = n.baseX + Math.sin(t + n.phase) * 0.012;
          n.y = n.baseY + Math.cos(t * 0.8 + n.phase) * 0.012;
        }
      }

      // find nearest signal node to pointer
      if (mouse.active) {
        let nearest: SignalNode | null = null;
        let nearestDist = 0.05;
        for (const n of nodes) {
          if (!n.isSignal) continue;
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = n;
          }
        }
        if (nearest) {
          setActiveSignal((prev) => (prev?.id === nearest!.id ? prev : nearest));
          setTooltipPos({ x: nearest.x * width, y: nearest.y * height });
        } else {
          setActiveSignal((prev) => (prev ? null : prev));
        }
      }

      // draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * (a.isSignal || b.isSignal ? 0.24 : 0.08);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }
      }

      // draw nodes
      for (const n of nodes) {
        const px = n.x * width;
        const py = n.y * height;
        if (n.isSignal) {
          const isActive = activeSignal?.id === n.id;
          const glowR = isActive ? 14 : 8;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
          grad.addColorStop(0, `rgba(255, 255, 255, ${isActive ? 0.55 : 0.3})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, glowR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isActive ? "#ffffff" : "#d4d4d4";
          ctx.beginPath();
          ctx.arc(px, py, n.r + (isActive ? 1 : 0), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(245, 243, 236, 0.35)";
          ctx.beginPath();
          ctx.arc(px, py, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    if (visible) {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />

      <AnimatePresence>
        {activeSignal?.data && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-xl border border-line-strong bg-ink-2/95 p-4 shadow-2xl backdrop-blur"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">
              Illustrative Signal
            </p>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Property</dt>
                <dd className="text-right text-paper">{activeSignal.data.property}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Value</dt>
                <dd className="text-right text-paper">{activeSignal.data.value}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Market</dt>
                <dd className="text-right text-paper">{activeSignal.data.market}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Status</dt>
                <dd className="text-right text-paper">{activeSignal.data.status}</dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
