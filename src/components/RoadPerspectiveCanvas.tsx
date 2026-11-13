import { useEffect, useRef } from 'react';
import { RideState } from '../data/calmRideData';

interface RoadPerspectiveCanvasProps {
  rideState: RideState;
  onCycleState: () => void;
}

export function RoadPerspectiveCanvas({
  rideState,
  onCycleState,
}: RoadPerspectiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<RideState>(rideState);

  useEffect(() => {
    stateRef.current = rideState;
  }, [rideState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let progress = 0;
    let currentSpeed = 1.0;
    let vanApproach = 0.0;
    let roadworksApproach = 0.0;
    let busStopApproach = 0.0;
    let lastTime = performance.now();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const drawGlowingDetectionBox = (
      x: number,
      y: number,
      w: number,
      h: number,
      label: string,
      color: string,
      glowColor: string,
      bgColor: string,
    ) => {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      drawRoundedRect(x, y, w, h, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = '700 15px "Public Sans", system-ui, sans-serif';
      const padX = 12;
      const textWidth = ctx.measureText(label).width;
      const pillW = textWidth + padX * 2;
      const pillH = 28;
      const pillX = Math.max(8, x);
      const pillY = Math.max(12, y - pillH - 6);

      ctx.fillStyle = bgColor;
      drawRoundedRect(pillX, pillY, pillW, pillH, 9);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0F233C';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pillX + padX, pillY + pillH / 2 + 0.5);
      ctx.restore();
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const parent = canvas.parentElement;
      const W = parent ? parent.clientWidth : 960;
      const H = parent ? parent.clientHeight : 540;
      const st = stateRef.current;

      const targetSpeed =
        st === 'cruising'
          ? 1.0
          : st === 'arriving'
          ? 0.28
          : st === 'slowdown'
          ? 0.03
          : 0.0;
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * 3.2);

      vanApproach +=
        ((st === 'slowdown' ? 1 : 0) - vanApproach) * Math.min(1, dt * 2.8);
      roadworksApproach +=
        ((st === 'safe-failure' ? 1 : 0) - roadworksApproach) *
        Math.min(1, dt * 2.8);
      busStopApproach +=
        ((st === 'arriving' ? 1 : 0) - busStopApproach) *
        Math.min(1, dt * 2.6);

      if (!prefersReducedMotion) {
        progress = (progress + dt * 0.44 * currentSpeed) % 1;
      }

      const horizonY = H * 0.36;
      const vpX = W * 0.5;

      // 1. Soft Slate-Blue Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#BBD0E2');
      skyGrad.addColorStop(1, '#EAF0F6');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY + 4);

      // Gentle Sheffield Pennine Hills
      ctx.fillStyle = '#9EB5C9';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.quadraticCurveTo(W * 0.22, horizonY - 38, W * 0.46, horizonY - 12);
      ctx.quadraticCurveTo(W * 0.72, horizonY - 46, W, horizonY - 8);
      ctx.lineTo(W, horizonY + 2);
      ctx.lineTo(0, horizonY + 2);
      ctx.closePath();
      ctx.fill();

      // 2. Ground & Roadside Verge
      ctx.fillStyle = '#CFD9CE';
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // 3. 2.5D Road & Pavements
      const roadTopHalf = W * 0.042;
      const roadBotHalf = W * 0.44;
      const paveTopHalf = W * 0.068;
      const paveBotHalf = W * 0.68;

      ctx.fillStyle = '#E5E1D8';
      ctx.beginPath();
      ctx.moveTo(vpX - paveTopHalf, horizonY);
      ctx.lineTo(vpX + paveTopHalf, horizonY);
      ctx.lineTo(vpX + paveBotHalf, H);
      ctx.lineTo(vpX - paveBotHalf, H);
      ctx.closePath();
      ctx.fill();

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      roadGrad.addColorStop(0, '#4B5A6B');
      roadGrad.addColorStop(1, '#313D4B');
      ctx.fillStyle = roadGrad;
      ctx.beginPath();
      ctx.moveTo(vpX - roadTopHalf, horizonY);
      ctx.lineTo(vpX + roadTopHalf, horizonY);
      ctx.lineTo(vpX + roadBotHalf, H);
      ctx.lineTo(vpX - roadBotHalf, H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#F7F5EF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vpX - roadTopHalf, horizonY);
      ctx.lineTo(vpX - roadBotHalf, H);
      ctx.moveTo(vpX + roadTopHalf, horizonY);
      ctx.lineTo(vpX + roadBotHalf, H);
      ctx.stroke();

      // Animated Center Lane Dashed Markings
      const numDashes = 10;
      for (let i = 0; i < numDashes; i++) {
        const rawT = (i / numDashes + progress) % 1;
        const t1 = Math.pow(rawT, 2.1);
        const t2 = Math.pow(Math.min(1, rawT + 0.045), 2.1);
        if (t2 <= t1) continue;

        const y1 = horizonY + t1 * (H - horizonY);
        const y2 = horizonY + t2 * (H - horizonY);
        const halfW1 = 1.5 + t1 * 6;
        const halfW2 = 1.5 + t2 * 6;

        ctx.fillStyle = 'rgba(250, 249, 245, 0.9)';
        ctx.beginPath();
        ctx.moveTo(vpX - halfW1, y1);
        ctx.lineTo(vpX + halfW1, y1);
        ctx.lineTo(vpX + halfW2, y2);
        ctx.lineTo(vpX - halfW2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Calm Projected Path Ribbon
      const isCaution = st === 'slowdown' || st === 'safe-failure';
      const pathStopY = isCaution
        ? horizonY + (H - horizonY) * 0.52
        : horizonY + (H - horizonY) * 0.28;
      const pathTopW = isCaution ? W * 0.095 : W * 0.045;
      const pathBotW = W * 0.24;

      const pathGrad = ctx.createLinearGradient(0, H, 0, pathStopY);
      if (isCaution) {
        pathGrad.addColorStop(0, 'rgba(217, 119, 6, 0.28)');
        pathGrad.addColorStop(1, 'rgba(217, 119, 6, 0.08)');
      } else {
        pathGrad.addColorStop(0, 'rgba(13, 110, 78, 0.30)');
        pathGrad.addColorStop(1, 'rgba(13, 110, 78, 0.06)');
      }
      ctx.fillStyle = pathGrad;
      ctx.beginPath();
      ctx.moveTo(vpX - pathBotW, H);
      ctx.lineTo(vpX + pathBotW, H);
      ctx.lineTo(vpX + pathTopW, pathStopY);
      ctx.lineTo(vpX - pathTopW, pathStopY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isCaution
        ? 'rgba(217, 119, 6, 0.8)'
        : 'rgba(13, 110, 78, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vpX - pathBotW, H);
      ctx.lineTo(vpX - pathTopW, pathStopY);
      ctx.moveTo(vpX + pathBotW, H);
      ctx.lineTo(vpX + pathTopW, pathStopY);
      ctx.stroke();

      // 5. Sheffield Terraces & Trees + Friendly Pedestrian
      const propCount = 6;
      const props: { depth: number; idx: number }[] = [];
      for (let i = 0; i < propCount; i++) {
        const raw = (i / propCount + progress) % 1;
        props.push({ depth: Math.pow(raw, 2.0), idx: i });
      }
      props.sort((a, b) => a.depth - b.depth);

      let pedestrianRect: { x: number; y: number; w: number; h: number } | null =
        null;

      for (const p of props) {
        const t = p.depth;
        if (t < 0.03) continue;
        const yBase = horizonY + t * (H - horizonY);
        const roadEdgeLeft =
          vpX - (roadTopHalf + t * (roadBotHalf - roadTopHalf));
        const roadEdgeRight =
          vpX + (roadTopHalf + t * (roadBotHalf - roadTopHalf));
        const scale = 0.18 + t * 1.15;

        const bW = 110 * scale;
        const bH = 125 * scale;
        const bX = roadEdgeLeft - 52 * scale - bW;
        const bY = yBase - bH;

        ctx.fillStyle = p.idx % 2 === 0 ? '#D7C4AE' : '#C9B39B';
        ctx.fillRect(bX, bY, bW, bH);

        ctx.fillStyle = '#4E5D6C';
        ctx.beginPath();
        ctx.moveTo(bX - 6 * scale, bY);
        ctx.lineTo(bX + bW * 0.5, bY - 30 * scale);
        ctx.lineTo(bX + bW + 6 * scale, bY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#F7E7B7';
        const winW = 20 * scale;
        const winH = 26 * scale;
        ctx.fillRect(bX + 18 * scale, bY + 26 * scale, winW, winH);
        ctx.fillRect(bX + bW - 38 * scale, bY + 26 * scale, winW, winH);

        const treeX = roadEdgeRight + 54 * scale;
        const trunkW = 10 * scale;
        const trunkH = 54 * scale;
        ctx.fillStyle = '#6B4F3A';
        ctx.fillRect(treeX - trunkW / 2, yBase - trunkH, trunkW, trunkH);

        ctx.fillStyle = p.idx % 2 === 0 ? '#3E7A56' : '#4C8B64';
        ctx.beginPath();
        ctx.arc(
          treeX,
          yBase - trunkH - 18 * scale,
          34 * scale,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        if (p.idx === 2 && t > 0.24 && t < 0.78) {
          const pedX = roadEdgeRight + 24 * scale;
          const pedH = 58 * scale;
          const pedW = 24 * scale;
          const pedY = yBase - pedH;

          ctx.fillStyle = '#28527A';
          drawRoundedRect(
            pedX - pedW / 2,
            pedY + 14 * scale,
            pedW,
            pedH - 14 * scale,
            6 * scale,
          );
          ctx.fill();
          ctx.fillStyle = '#F3D2B3';
          ctx.beginPath();
          ctx.arc(pedX, pedY + 8 * scale, 7.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          pedestrianRect = {
            x: pedX - pedW * 0.9,
            y: pedY - 6 * scale,
            w: pedW * 1.8,
            h: pedH + 10 * scale,
          };
        }
      }

      // 6. Parked Delivery Van (State 2: Obstacle Slowdown)
      if (vanApproach > 0.08) {
        const vanT = 0.22 + vanApproach * 0.23;
        const vanYBase = horizonY + vanT * (H - horizonY);
        const vanScale = 0.45 + vanT * 1.35;
        const vanW = 152 * vanScale;
        const vanH = 110 * vanScale;
        const vanX = vpX - vanW * 0.72;
        const vanY = vanYBase - vanH;

        ctx.save();
        ctx.globalAlpha = Math.min(1, vanApproach * 1.4);

        ctx.fillStyle = 'rgba(15, 35, 60, 0.35)';
        drawRoundedRect(vanX - 8, vanYBase - 8, vanW + 16, 16, 8);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        drawRoundedRect(
          vanX,
          vanY,
          vanW,
          vanH - 12 * vanScale,
          10 * vanScale,
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2B5B84';
        ctx.fillRect(
          vanX + 6 * vanScale,
          vanY + vanH * 0.48,
          vanW - 12 * vanScale,
          14 * vanScale,
        );

        ctx.fillStyle = '#334155';
        ctx.fillRect(
          vanX + 14 * vanScale,
          vanY + 12 * vanScale,
          vanW * 0.32,
          22 * vanScale,
        );
        ctx.fillRect(
          vanX + vanW * 0.54,
          vanY + 12 * vanScale,
          vanW * 0.32,
          22 * vanScale,
        );

        const blinkOn = Math.floor(now / 520) % 2 === 0;
        ctx.fillStyle = blinkOn ? '#F59E0B' : '#92400E';
        ctx.beginPath();
        ctx.arc(
          vanX + 16 * vanScale,
          vanY + vanH - 22 * vanScale,
          6 * vanScale,
          0,
          Math.PI * 2,
        );
        ctx.arc(
          vanX + vanW - 16 * vanScale,
          vanY + vanH - 22 * vanScale,
          6 * vanScale,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        drawGlowingDetectionBox(
          vanX - 10,
          vanY - 10,
          vanW + 20,
          vanH + 14,
          'Parked Van — Waiting Safely',
          '#D97706',
          'rgba(245, 158, 11, 0.75)',
          'rgba(254, 243, 199, 0.96)',
        );
        ctx.restore();
      }

      // 7. Roadworks Barrier & Cones (State 3: Safe Failure & Recovery Mode)
      if (roadworksApproach > 0.08) {
        const rwT = 0.25 + roadworksApproach * 0.2;
        const rwYBase = horizonY + rwT * (H - horizonY);
        const rwScale = 0.5 + rwT * 1.3;
        const barW = 190 * rwScale;
        const barH = 44 * rwScale;
        const barX = vpX - barW * 0.5;
        const barY = rwYBase - barH - 12 * rwScale;

        ctx.save();
        ctx.globalAlpha = Math.min(1, roadworksApproach * 1.4);

        // Barrier board
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2.5;
        drawRoundedRect(barX, barY, barW, barH, 8);
        ctx.fill();
        ctx.stroke();

        // Diagonal white stripes on barrier
        ctx.fillStyle = '#FFFFFF';
        for (let sx = 0; sx < 4; sx++) {
          ctx.fillRect(
            barX + (18 + sx * 42) * rwScale,
            barY + 8 * rwScale,
            18 * rwScale,
            barH - 16 * rwScale,
          );
        }

        // Cones
        [-0.42, 0, 0.42].forEach((offset) => {
          const cx = vpX + offset * barW;
          const cy = rwYBase;
          ctx.fillStyle = '#EA580C';
          ctx.beginPath();
          ctx.moveTo(cx - 14 * rwScale, cy);
          ctx.lineTo(cx, cy - 34 * rwScale);
          ctx.lineTo(cx + 14 * rwScale, cy);
          ctx.closePath();
          ctx.fill();
        });

        drawGlowingDetectionBox(
          barX - 14,
          barY - 12,
          barW + 28,
          barH + 46 * rwScale,
          'Roadworks Ahead — Pulled Over Safely',
          '#D97706',
          'rgba(245, 158, 11, 0.75)',
          'rgba(254, 243, 199, 0.96)',
        );
        ctx.restore();
      }

      // 8. Approaching Town Bus Stop Shelter (State 4: Approaching Destination)
      if (busStopApproach > 0.08) {
        const bsT = 0.25 + busStopApproach * 0.26;
        const bsYBase = horizonY + bsT * (H - horizonY);
        const bsScale = 0.5 + bsT * 1.2;
        const roadLeft = vpX - (roadTopHalf + bsT * (roadBotHalf - roadTopHalf));
        const shW = 92 * bsScale;
        const shH = 105 * bsScale;
        const shX = roadLeft - shW - 14 * bsScale;
        const shY = bsYBase - shH;

        ctx.save();
        ctx.globalAlpha = Math.min(1, busStopApproach * 1.4);

        ctx.fillStyle = '#0D6E4E';
        drawRoundedRect(shX, shY, shW, shH, 8);
        ctx.fill();
        ctx.fillStyle = '#E3F4ED';
        ctx.fillRect(shX + 10 * bsScale, shY + 18 * bsScale, shW - 20 * bsScale, shH * 0.46);

        drawGlowingDetectionBox(
          shX - 10,
          shY - 10,
          shW + 20,
          shH + 18,
          'Your Bus Stop — Pulling In Safely',
          '#0D6E4E',
          'rgba(16, 185, 129, 0.75)',
          'rgba(227, 244, 237, 0.96)',
        );
        ctx.restore();
      }

      // 9. Proof It Sees: Pedestrian on Pavement
      if (pedestrianRect) {
        drawGlowingDetectionBox(
          pedestrianRect.x,
          pedestrianRect.y,
          pedestrianRect.w,
          pedestrianRect.h,
          'Person Spotted — Giving Extra Space',
          '#0D6E4E',
          'rgba(16, 185, 129, 0.75)',
          'rgba(227, 244, 237, 0.95)',
        );
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Driver road perspective currently showing ${rideState}. Click anywhere on the road view to cycle to the next ride state.`}
      onClick={onCycleState}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleState();
        }
      }}
      className="relative w-full h-full cursor-pointer select-none overflow-hidden bg-[#DCE6EE]"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
