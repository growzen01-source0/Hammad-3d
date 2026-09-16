import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
} from 'lucide-react';

export type MetricType = 'arr' | 'roas' | 'conv';
export type ChartStyle = 'area' | 'bar' | 'donut';

interface DataPoint {
  label: string;
  quarter: string;
  value: number;
  formattedValue: string;
  industryValue: number;
  formattedIndustry: string;
  roi: string;
  desc: string;
}

interface ChannelBreakdown {
  name: string;
  share: number;
  color: string;
  growth: string;
  volume: string;
}

const CHANNELS: ChannelBreakdown[] = [
  { name: 'Paid Social & Meta Ads', share: 42, color: '#10f48e', growth: '+340%', volume: '$357K' },
  { name: 'Google High-Intent Search', share: 26, color: '#38bdf8', growth: '+280%', volume: '$221K' },
  { name: 'Conversion Rate Opt (CRO)', share: 20, color: '#34d399', growth: '+410%', volume: '$170K' },
  { name: 'Omnichannel Retargeting', share: 12, color: '#a78bfa', growth: '+190%', volume: '$102K' },
];

const DATASETS = {
  arr: {
    name: 'Revenue ARR',
    unit: '$',
    badge: '+450% Surge',
    peak: '$850K+ ARR',
    yMin: 0,
    yMax: 900,
    yTicks: [
      { val: 0, label: '$0' },
      { val: 200, label: '$200K' },
      { val: 400, label: '$400K' },
      { val: 600, label: '$600K' },
      { val: 850, label: '$850K' },
    ],
    data: [
      { label: 'Q1 Launch', quarter: 'Q1', value: 28, formattedValue: '$28K', industryValue: 16, formattedIndustry: '$16K', roi: '+40% ROI', desc: 'Brand positioning & paid acquisition funnels deployed' },
      { label: 'Q2 Scale', quarter: 'Q2', value: 96, formattedValue: '$96K', industryValue: 32, formattedIndustry: '$32K', roi: '+120% ROI', desc: 'Creative testing & automated ROAS bidding algorithms' },
      { label: 'Q3 Engine', quarter: 'Q3', value: 245, formattedValue: '$245K', industryValue: 56, formattedIndustry: '$56K', roi: '+240% ROI', desc: 'Omnichannel conversion pipeline & checkout velocity' },
      { label: 'Q4 Surge', quarter: 'Q4', value: 490, formattedValue: '$490K', industryValue: 85, formattedIndustry: '$85K', roi: '+360% ROI', desc: 'Predictive intent retargeting & enterprise scale' },
      { label: 'Apex Peak', quarter: 'Apex', value: 850, formattedValue: '$850K+', industryValue: 115, formattedIndustry: '$115K', roi: '+450% ROI', desc: 'Category leadership & automated customer acquisition' },
    ],
  },
  roas: {
    name: 'ROAS Multiplier',
    unit: 'x',
    badge: '14.8x Return',
    peak: '14.8x ROAS',
    yMin: 0,
    yMax: 16,
    yTicks: [
      { val: 0, label: '0x' },
      { val: 4, label: '4x' },
      { val: 8, label: '8x' },
      { val: 12, label: '12x' },
      { val: 15, label: '15x' },
    ],
    data: [
      { label: 'Audit', quarter: 'Q1', value: 2.4, formattedValue: '2.4x', industryValue: 1.8, formattedIndustry: '1.8x', roi: '+33% Lead', desc: 'Eliminating budget leaks and audience recalibration' },
      { label: 'Creative', quarter: 'Q2', value: 6.2, formattedValue: '6.2x', industryValue: 2.1, formattedIndustry: '2.1x', roi: '+195% Lead', desc: 'High-converting UGC & cinematic visual ad sprints' },
      { label: 'Modeling', quarter: 'Q3', value: 9.8, formattedValue: '9.8x', industryValue: 2.3, formattedIndustry: '2.3x', roi: '+326% Lead', desc: 'Proprietary intent modeling & micro-segmentation' },
      { label: 'Omni', quarter: 'Q4', value: 12.6, formattedValue: '12.6x', industryValue: 2.4, formattedIndustry: '2.4x', roi: '+425% Lead', desc: 'Cross-platform conversion triggers & dynamic retargeting' },
      { label: 'Apex', quarter: 'Apex', value: 14.8, formattedValue: '14.8x', industryValue: 2.5, formattedIndustry: '2.5x', roi: '+492% Lead', desc: 'Algorithmic ROAS compounding across Google & Meta' },
    ],
  },
  conv: {
    name: 'Conversion Rate',
    unit: '%',
    badge: '9.6% CVR',
    peak: '9.6% Rate',
    yMin: 0,
    yMax: 11,
    yTicks: [
      { val: 0, label: '0%' },
      { val: 2.5, label: '2.5%' },
      { val: 5, label: '5.0%' },
      { val: 7.5, label: '7.5%' },
      { val: 10, label: '10%' },
    ],
    data: [
      { label: 'Speed', quarter: 'Q1', value: 1.5, formattedValue: '1.5%', industryValue: 1.2, formattedIndustry: '1.2%', roi: '+25% Gain', desc: 'Page load accelerated to <0.6s & mobile friction reduced' },
      { label: 'Trust', quarter: 'Q2', value: 3.6, formattedValue: '3.6%', industryValue: 1.5, formattedIndustry: '1.5%', roi: '+140% Gain', desc: 'Live verification widgets & high-trust architecture' },
      { label: 'Checkout', quarter: 'Q3', value: 6.1, formattedValue: '6.1%', industryValue: 1.7, formattedIndustry: '1.7%', roi: '+258% Gain', desc: 'Frictionless checkout flow & dynamic pricing triggers' },
      { label: 'Predictive', quarter: 'Q4', value: 8.2, formattedValue: '8.2%', industryValue: 1.9, formattedIndustry: '1.9%', roi: '+331% Gain', desc: 'Dynamic landing page matching & copy personalization' },
      { label: 'Apex', quarter: 'Apex', value: 9.6, formattedValue: '9.6%', industryValue: 2.0, formattedIndustry: '2.0%', roi: '+380% Gain', desc: 'Industry-shattering 9.6% conversion velocity' },
    ],
  },
};

export const ThreeGrowthModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeMetric, setActiveMetric] = useState<MetricType>('arr');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const currentDataset = useMemo(() => DATASETS[activeMetric], [activeMetric]);

  // Animation values
  const animProgressRef = useRef(0);
  const photonPosRef = useRef(0);
  const donutAngleRef = useRef(0);

  const chartStyleRef = useRef(chartStyle);
  chartStyleRef.current = chartStyle;

  const metricRef = useRef(activeMetric);
  metricRef.current = activeMetric;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    animProgressRef.current = 0;

    const render = () => {
      if (!isRunning) return;
      animId = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Smooth progress on metric/style switch
      if (animProgressRef.current < 1) {
        animProgressRef.current += 0.055;
        if (animProgressRef.current > 1) animProgressRef.current = 1;
      }

      photonPosRef.current = (photonPosRef.current + 0.007) % 1;
      donutAngleRef.current = (donutAngleRef.current + 0.006) % (Math.PI * 2);

      const currentStyle = chartStyleRef.current;
      const dataset = DATASETS[metricRef.current];

      // Subtle Background Cyber Radial Gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      bgGrad.addColorStop(0, 'rgba(16, 244, 142, 0.07)');
      bgGrad.addColorStop(0.55, 'rgba(6, 17, 12, 0.45)');
      bgGrad.addColorStop(1, 'rgba(6, 7, 9, 0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 1. AREA SPLINE GRAPH MODE
      // ==========================================
      if (currentStyle === 'area') {
        const padLeft = 44;
        const padRight = 24;
        const padTop = 28;
        const padBottom = 34;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const data = dataset.data;
        const yMin = dataset.yMin;
        const yMax = dataset.yMax;

        // Draw Horizontal Grid
        dataset.yTicks.forEach((tick) => {
          const normY = (tick.val - yMin) / (yMax - yMin);
          const y = padTop + plotH - normY * plotH;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(padLeft, y);
          ctx.lineTo(width - padRight, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = '10px "Space Grotesk", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(tick.label, padLeft - 8, y);
        });

        // Compute Coordinates
        const points: { x: number; y: number; data: DataPoint }[] = [];
        const industryPoints: { x: number; y: number }[] = [];

        data.forEach((item, i) => {
          const x = padLeft + (i / (data.length - 1)) * plotW;
          const normVal = (item.value - yMin) / (yMax - yMin);
          const ease = Math.min(1, animProgressRef.current * (1 + i * 0.15));
          const y = padTop + plotH - (normVal * plotH * ease);
          points.push({ x, y, data: item });

          const normInd = (item.industryValue - yMin) / (yMax - yMin);
          const indY = padTop + plotH - normInd * plotH;
          industryPoints.push({ x, y: indY });
        });

        // Industry Reference Line
        if (industryPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(industryPoints[0].x, industryPoints[0].y);
          for (let i = 0; i < industryPoints.length - 1; i++) {
            const xc = (industryPoints[i].x + industryPoints[i + 1].x) / 2;
            const yc = (industryPoints[i].y + industryPoints[i + 1].y) / 2;
            ctx.quadraticCurveTo(industryPoints[i].x, industryPoints[i].y, xc, yc);
          }
          ctx.lineTo(industryPoints[industryPoints.length - 1].x, industryPoints[industryPoints.length - 1].y);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.font = '9px "Space Grotesk", monospace';
          ctx.textAlign = 'right';
          ctx.fillText('Industry Avg', industryPoints[industryPoints.length - 1].x - 6, industryPoints[industryPoints.length - 1].y - 8);
        }

        // Area Fill
        if (points.length > 1) {
          const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
          areaGrad.addColorStop(0, 'rgba(16, 244, 142, 0.35)');
          areaGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.1)');
          areaGrad.addColorStop(1, 'rgba(16, 244, 142, 0.0)');

          ctx.beginPath();
          ctx.moveTo(points[0].x, padTop + plotH);
          ctx.lineTo(points[0].x, points[0].y);

          for (let i = 0; i < points.length - 1; i++) {
            const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 2;
            const cp1y = points[i].y;
            const cp2x = points[i].x + (points[i + 1].x - points[i].x) / 2;
            const cp2y = points[i + 1].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
          }

          ctx.lineTo(points[points.length - 1].x, padTop + plotH);
          ctx.closePath();
          ctx.fillStyle = areaGrad;
          ctx.fill();

          // Main Neon Spline
          const strokeGrad = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
          strokeGrad.addColorStop(0, '#10f48e');
          strokeGrad.addColorStop(0.7, '#34d399');
          strokeGrad.addColorStop(1, '#38bdf8');

          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < points.length - 1; i++) {
            const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 2;
            const cp1y = points[i].y;
            const cp2x = points[i].x + (points[i + 1].x - points[i].x) / 2;
            const cp2y = points[i + 1].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
          }

          ctx.strokeStyle = strokeGrad;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#10f48e';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Traveling Photon
        if (points.length > 1) {
          const t = photonPosRef.current;
          const totalSegments = points.length - 1;
          const seg = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
          const segT = (t * totalSegments) - seg;

          const p0 = points[seg];
          const p1 = points[seg + 1];

          const cp1x = p0.x + (p1.x - p0.x) / 2;
          const cp1y = p0.y;
          const cp2x = p0.x + (p1.x - p0.x) / 2;
          const cp2y = p1.y;

          const u = segT;
          const px = Math.pow(1 - u, 3) * p0.x +
            3 * Math.pow(1 - u, 2) * u * cp1x +
            3 * (1 - u) * Math.pow(u, 2) * cp2x +
            Math.pow(u, 3) * p1.x;
          const py = Math.pow(1 - u, 3) * p0.y +
            3 * Math.pow(1 - u, 2) * u * cp1y +
            3 * (1 - u) * Math.pow(u, 2) * cp2y +
            Math.pow(u, 3) * p1.y;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#10f48e';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#10f48e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 7.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // X-Axis Labels & Nodes
        points.forEach((pt, i) => {
          const isHovered = hoveredIndex === i;
          const isPeak = i === points.length - 1;

          ctx.fillStyle = isHovered ? '#10f48e' : 'rgba(255, 255, 255, 0.5)';
          ctx.font = isHovered ? 'bold 10px "Space Grotesk", monospace' : '10px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(pt.data.label, pt.x, height - 12);

          if (isHovered || isPeak) {
            ctx.strokeStyle = isHovered ? 'rgba(16, 244, 142, 0.4)' : 'rgba(16, 244, 142, 0.2)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x, padTop + plotH);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.fillStyle = isPeak ? '#10f48e' : (isHovered ? '#38bdf8' : '#071710');
          ctx.strokeStyle = isPeak ? '#ffffff' : (isHovered ? '#10f48e' : '#10f48e');
          ctx.lineWidth = isHovered || isPeak ? 2.5 : 1.5;

          ctx.shadowColor = isPeak ? '#10f48e' : '#38bdf8';
          ctx.shadowBlur = isHovered || isPeak ? 16 : 8;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isHovered ? 6.5 : (isPeak ? 5.5 : 4), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (isPeak && !isHovered) {
            ctx.fillStyle = '#10f48e';
            ctx.font = 'bold 9px "Space Grotesk", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(pt.data.roi, pt.x, pt.y - 12);
          }
        });
      }

      // ==========================================
      // 2. DUAL COMPARATIVE CYBER BAR CHART MODE
      // ==========================================
      else if (currentStyle === 'bar') {
        const padLeft = 44;
        const padRight = 24;
        const padTop = 28;
        const padBottom = 34;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const data = dataset.data;
        const yMin = dataset.yMin;
        const yMax = dataset.yMax;

        // Grid Lines
        dataset.yTicks.forEach((tick) => {
          const normY = (tick.val - yMin) / (yMax - yMin);
          const y = padTop + plotH - normY * plotH;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(padLeft, y);
          ctx.lineTo(width - padRight, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = '10px "Space Grotesk", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(tick.label, padLeft - 8, y);
        });

        const numGroups = data.length;
        const groupWidth = plotW / numGroups;
        const barW = Math.min(18, groupWidth * 0.28);
        const gap = 4;

        data.forEach((item, i) => {
          const centerX = padLeft + (i + 0.5) * groupWidth;
          const isHovered = hoveredIndex === i;

          // 1. Industry Bar (dimmed gray/red)
          const normInd = (item.industryValue - yMin) / (yMax - yMin);
          const indBarH = normInd * plotH * animProgressRef.current;
          const indX = centerX - barW - gap / 2;
          const indY = padTop + plotH - indBarH;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(indX, indY, barW, indBarH, [4, 4, 0, 0]);
          ctx.fill();

          // 2. Growzen Bar (Glowing Emerald with Laser Cap)
          const normVal = (item.value - yMin) / (yMax - yMin);
          const growBarH = normVal * plotH * animProgressRef.current;
          const growX = centerX + gap / 2;
          const growY = padTop + plotH - growBarH;

          const barGrad = ctx.createLinearGradient(0, growY, 0, padTop + plotH);
          barGrad.addColorStop(0, isHovered ? '#4ade80' : '#10f48e');
          barGrad.addColorStop(1, 'rgba(16, 244, 142, 0.15)');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(growX, growY, barW, growBarH, [4, 4, 0, 0]);
          ctx.fill();

          // Glowing Cap on Growzen Bar
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#10f48e';
          ctx.shadowBlur = 12;
          ctx.fillRect(growX, growY, barW, 2.5);
          ctx.shadowBlur = 0;

          // Value on top of Growzen Bar
          ctx.fillStyle = isHovered ? '#10f48e' : 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 9px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(item.formattedValue, growX + barW / 2, growY - 6);

          // X-Axis Label
          ctx.fillStyle = isHovered ? '#10f48e' : 'rgba(255, 255, 255, 0.5)';
          ctx.font = isHovered ? 'bold 10px "Space Grotesk", monospace' : '10px "Space Grotesk", monospace';
          ctx.fillText(item.quarter, centerX, height - 12);
        });

        // Legend for bars in top-right corner of canvas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(width - 150, 10, 8, 8);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px "Space Grotesk", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Industry', width - 138, 17);

        ctx.fillStyle = '#10f48e';
        ctx.fillRect(width - 80, 10, 8, 8);
        ctx.fillStyle = '#10f48e';
        ctx.fillText('Growzen', width - 68, 17);
      }

      // ==========================================
      // 3. RADIAL / DONUT CHANNEL CONVERSION MODE
      // ==========================================
      else if (currentStyle === 'donut') {
        const cx = width * 0.4;
        const cy = height * 0.5;
        const radius = Math.min(width * 0.28, height * 0.38);
        const innerRadius = radius * 0.62;

        let startAngle = donutAngleRef.current;
        const total = CHANNELS.reduce((acc, c) => acc + c.share, 0);

        // Draw Slices
        CHANNELS.forEach((channel, idx) => {
          const sliceAngle = (channel.share / total) * Math.PI * 2;
          const endAngle = startAngle + sliceAngle;
          const isHovered = hoveredIndex === idx;
          const radOffset = isHovered ? 6 : 0;

          const midAngle = startAngle + sliceAngle / 2;
          const shiftX = Math.cos(midAngle) * radOffset;
          const shiftY = Math.sin(midAngle) * radOffset;

          ctx.beginPath();
          ctx.arc(cx + shiftX, cy + shiftY, radius, startAngle, endAngle);
          ctx.arc(cx + shiftX, cy + shiftY, innerRadius, endAngle, startAngle, true);
          ctx.closePath();

          ctx.fillStyle = channel.color;
          ctx.shadowColor = channel.color;
          ctx.shadowBlur = isHovered ? 20 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          startAngle = endAngle;
        });

        // Center Cyber Core
        ctx.fillStyle = '#060a0f';
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 244, 142, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#10f48e';
        ctx.font = 'bold 13px "Space Grotesk", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+450%', cx, cy - 8);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '9px "Space Grotesk", monospace';
        ctx.fillText('APEX ROI', cx, cy + 9);

        // Right-Hand Legend List
        const legendX = width * 0.72;
        const legendStartY = height * 0.22;
        const rowHeight = (height * 0.58) / CHANNELS.length;

        CHANNELS.forEach((ch, idx) => {
          const y = legendStartY + idx * rowHeight;
          const isHovered = hoveredIndex === idx;

          // Color box
          ctx.fillStyle = ch.color;
          ctx.shadowColor = ch.color;
          ctx.shadowBlur = isHovered ? 10 : 0;
          ctx.beginPath();
          ctx.roundRect(legendX - 22, y - 6, 12, 12, 3);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Channel Name
          ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
          ctx.font = isHovered ? 'bold 10px "Space Grotesk", monospace' : '10px "Space Grotesk", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(ch.name, legendX, y - 1);

          // Sub stats
          ctx.fillStyle = ch.color;
          ctx.font = '9px "Space Grotesk", monospace';
          ctx.fillText(`${ch.share}% (${ch.volume}) • ${ch.growth}`, legendX, y + 12);
        });
      }

      ctx.restore();
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [activeMetric, chartStyle, hoveredIndex]);

  // Pointer move handler to inspect nodes
  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    setMousePos({ x: relX, y: relY });

    if (chartStyle === 'donut') {
      // Donut slice detection
      const cx = rect.width * 0.4;
      const cy = rect.height * 0.5;
      const dist = Math.hypot(relX - cx, relY - cy);
      const radius = Math.min(rect.width * 0.28, rect.height * 0.38);
      if (dist >= radius * 0.5 && dist <= radius * 1.2) {
        let angle = Math.atan2(relY - cy, relX - cx) - donutAngleRef.current;
        angle = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        let accumulated = 0;
        for (let i = 0; i < CHANNELS.length; i++) {
          const sliceAngle = (CHANNELS[i].share / 100) * Math.PI * 2;
          if (angle >= accumulated && angle <= accumulated + sliceAngle) {
            setHoveredIndex(i);
            return;
          }
          accumulated += sliceAngle;
        }
      }
      setHoveredIndex(null);
      return;
    }

    // Spline & Bar detection
    const padLeft = 44;
    const padRight = 24;
    const plotW = rect.width - padLeft - padRight;
    const dataLen = currentDataset.data.length;

    let closestIdx: number | null = null;
    let minDist = 9999;

    for (let i = 0; i < dataLen; i++) {
      const ptX = padLeft + (i / (dataLen - 1)) * plotW;
      const dist = Math.abs(relX - ptX);
      if (dist < minDist && dist < 45) {
        minDist = dist;
        closestIdx = i;
      }
    }

    setHoveredIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      id="three-growth-model-container"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerLeave}
      className="w-full h-88 sm:h-96 md:h-[420px] relative flex flex-col justify-between select-none overflow-hidden rounded-2xl bg-[#060709] border border-white/10 hover:border-[#10f48e]/50 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.85)]"
      title="Growzen Growth Terminal: Interactive Performance Graph"
    >
      {/* 1. Top Cyber HUD Controls Bar */}
      <div className="w-full px-3.5 pt-3 flex items-center justify-between z-20 gap-2 flex-wrap border-b border-white/5 pb-2.5 bg-black/50 backdrop-blur-md">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0d1017] p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveMetric('arr');
              animProgressRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMetric === 'arr'
                ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_12px_rgba(16,244,142,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ARR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMetric('roas');
              animProgressRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMetric === 'roas'
                ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_12px_rgba(16,244,142,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ROAS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMetric('conv');
              animProgressRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMetric === 'conv'
                ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_12px_rgba(16,244,142,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>CVR</span>
          </button>
        </div>

        {/* Chart Style Switcher (Area Spline / Dual Bar / Donut) */}
        <div className="flex items-center gap-1 bg-black/75 p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => {
              setChartStyle('area');
              animProgressRef.current = 0;
            }}
            title="Area Spline Graph"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'area'
                ? 'bg-white/20 text-[#10f48e] font-bold border border-[#10f48e]/40 shadow-[0_0_10px_rgba(16,244,142,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Spline</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartStyle('bar');
              animProgressRef.current = 0;
            }}
            title="Comparative Dual Bar Chart"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'bar'
                ? 'bg-white/20 text-[#10f48e] font-bold border border-[#10f48e]/40 shadow-[0_0_10px_rgba(16,244,142,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Bars</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartStyle('donut');
              animProgressRef.current = 0;
            }}
            title="Channel Attribution Donut"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'donut'
                ? 'bg-white/20 text-[#10f48e] font-bold border border-[#10f48e]/40 shadow-[0_0_10px_rgba(16,244,142,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Mix</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Canvas Graph Engine */}
      <div className="relative w-full flex-1 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Floating Cyber HUD Tooltip for Line / Bar */}
        {chartStyle !== 'donut' && hoveredIndex !== null && currentDataset.data[hoveredIndex] && mousePos && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#070b10]/95 border border-[#10f48e] text-left font-mono-tech shadow-[0_0_25px_rgba(16,244,142,0.35)] backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-4 min-w-[190px]"
            style={{
              left: `${Math.max(100, Math.min(mousePos.x, (containerRef.current?.clientWidth || 340) - 100))}px`,
              top: `${Math.max(80, mousePos.y - 10)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-[#10f48e] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {currentDataset.data[hoveredIndex].label}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#10f48e]/20 text-[#10f48e] text-[10px] font-bold">
                {currentDataset.data[hoveredIndex].roi}
              </span>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Growzen:</span>
                <span className="text-white font-bold text-[12px] text-[#10f48e]">
                  {currentDataset.data[hoveredIndex].formattedValue}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Industry Avg:</span>
                <span className="text-neutral-400">
                  {currentDataset.data[hoveredIndex].formattedIndustry}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-neutral-400 leading-tight border-t border-white/10 pt-1.5">
              {currentDataset.data[hoveredIndex].desc}
            </p>
          </div>
        )}

        {/* Initial Hover Hint */}
        {hoveredIndex === null && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[9px] font-mono-tech text-neutral-400 tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/50 border border-white/5 backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] animate-ping" />
            <span>
              {chartStyle === 'area'
                ? 'Hover spline to inspect quarter nodes'
                : chartStyle === 'bar'
                ? 'Hover bars to compare vs industry'
                : 'Hover pie slices for channel ROI'}
            </span>
          </div>
        )}
      </div>

      {/* 3. Bottom Live Performance Ribbon */}
      <div className="w-full px-3.5 py-2.5 flex items-center justify-between z-20 border-t border-white/10 text-[10px] font-mono-tech text-neutral-400 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#10f48e] animate-pulse" />
          <span className="text-white font-semibold">{currentDataset.name}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-[#10f48e] font-bold">{currentDataset.peak}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-400 hidden sm:inline-block">Live Feed</span>
          <div className="flex items-center gap-1 text-[#10f48e] font-bold">
            <span>+450% Delta</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
