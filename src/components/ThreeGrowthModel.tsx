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
  Radar,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Layers,
} from 'lucide-react';

export type MetricType = 'arr' | 'roas' | 'conv' | 'pipeline';
export type ChartStyle = 'spline' | 'bars' | 'radar' | 'orbit';
export type TimeHorizon = 'quarterly' | 'monthly' | 'projection';

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

interface RadarPillar {
  axis: string;
  growzen: number;
  industry: number;
  metric: string;
  desc: string;
}

const CHANNELS: ChannelBreakdown[] = [
  { name: 'Paid Social & Meta Ads', share: 42, color: '#8B5CF6', growth: '+340%', volume: '$357K' },
  { name: 'Google High-Intent Search', share: 26, color: '#22D3EE', growth: '+280%', volume: '$221K' },
  { name: 'Conversion Rate Opt (CRO)', share: 20, color: '#A78BFA', growth: '+410%', volume: '$170K' },
  { name: 'Omnichannel Retargeting', share: 12, color: '#06B6D4', growth: '+190%', volume: '$102K' },
];

const RADAR_PILLARS: RadarPillar[] = [
  { axis: 'Creative Sprints', growzen: 96, industry: 44, metric: '72hr Turnaround', desc: 'Cinematic ad sprints & dynamic UGC variants' },
  { axis: 'Algorithmic ROAS', growzen: 98, industry: 40, metric: '14.8x Return', desc: 'Predictive bidding & AI audience segmentation' },
  { axis: 'Conversion Velocity', growzen: 92, industry: 36, metric: '9.6% CVR', desc: 'Zero-friction checkout & instant page loads' },
  { axis: 'Retention & LTV', growzen: 88, industry: 48, metric: '4.2x LTV', desc: 'Predictive lifecycle email & repeat buyer funnels' },
  { axis: 'Data Attribution', growzen: 95, industry: 42, metric: '99.4% Match', desc: 'First-party server-side tracking & clean signals' },
  { axis: 'Market Scaling', growzen: 94, industry: 38, metric: '+450% Surge', desc: 'Multi-market international campaign scaling' },
];

// Rich datasets for all metrics and timeframe horizons
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
    quarterly: [
      { label: 'Q1 Launch', quarter: 'Q1', value: 28, formattedValue: '$28K', industryValue: 16, formattedIndustry: '$16K', roi: '+40% ROI', desc: 'Brand positioning & paid acquisition funnels deployed' },
      { label: 'Q2 Scale', quarter: 'Q2', value: 96, formattedValue: '$96K', industryValue: 32, formattedIndustry: '$32K', roi: '+120% ROI', desc: 'Creative testing & automated ROAS bidding algorithms' },
      { label: 'Q3 Engine', quarter: 'Q3', value: 245, formattedValue: '$245K', industryValue: 56, formattedIndustry: '$56K', roi: '+240% ROI', desc: 'Omnichannel conversion pipeline & checkout velocity' },
      { label: 'Q4 Surge', quarter: 'Q4', value: 490, formattedValue: '$490K', industryValue: 85, formattedIndustry: '$85K', roi: '+360% ROI', desc: 'Predictive intent retargeting & enterprise scale' },
      { label: 'Apex Peak', quarter: 'Apex', value: 850, formattedValue: '$850K+', industryValue: 115, formattedIndustry: '$115K', roi: '+450% ROI', desc: 'Category leadership & automated customer acquisition' },
    ],
    monthly: [
      { label: 'M1', quarter: 'M1', value: 18, formattedValue: '$18K', industryValue: 12, formattedIndustry: '$12K', roi: '+25%', desc: 'Initial baseline audit' },
      { label: 'M2', quarter: 'M2', value: 28, formattedValue: '$28K', industryValue: 15, formattedIndustry: '$15K', roi: '+40%', desc: 'Funnel architecture' },
      { label: 'M3', quarter: 'M3', value: 52, formattedValue: '$52K', industryValue: 20, formattedIndustry: '$20K', roi: '+75%', desc: 'Creative matrix deployed' },
      { label: 'M4', quarter: 'M4', value: 96, formattedValue: '$96K', industryValue: 28, formattedIndustry: '$28K', roi: '+120%', desc: 'Bidding optimization' },
      { label: 'M5', quarter: 'M5', value: 150, formattedValue: '$150K', industryValue: 38, formattedIndustry: '$38K', roi: '+170%', desc: 'Audience lookalikes' },
      { label: 'M6', quarter: 'M6', value: 245, formattedValue: '$245K', industryValue: 52, formattedIndustry: '$52K', roi: '+240%', desc: 'Omnichannel expansion' },
      { label: 'M7', quarter: 'M7', value: 330, formattedValue: '$330K', industryValue: 65, formattedIndustry: '$65K', roi: '+290%', desc: 'High-intent search surge' },
      { label: 'M8', quarter: 'M8', value: 490, formattedValue: '$490K', industryValue: 78, formattedIndustry: '$78K', roi: '+360%', desc: 'Dynamic remarketing' },
      { label: 'M9', quarter: 'M9', value: 610, formattedValue: '$610K', industryValue: 90, formattedIndustry: '$90K', roi: '+395%', desc: 'Enterprise volume boost' },
      { label: 'M10', quarter: 'M10', value: 720, formattedValue: '$720K', industryValue: 102, formattedIndustry: '$102K', roi: '+420%', desc: 'Conversion rate refinement' },
      { label: 'M11', quarter: 'M11', value: 810, formattedValue: '$810K', industryValue: 110, formattedIndustry: '$110K', roi: '+440%', desc: 'Full market penetration' },
      { label: 'M12 Apex', quarter: 'Apex', value: 850, formattedValue: '$850K+', industryValue: 118, formattedIndustry: '$118K', roi: '+450%', desc: 'Apex ARR run rate compounding' },
    ],
    projection: [
      { label: 'Year 1', quarter: 'Y1', value: 850, formattedValue: '$850K', industryValue: 120, formattedIndustry: '$120K', roi: '+450%', desc: 'Established market footprint' },
      { label: 'Year 2 (Est)', quarter: 'Y2', value: 2400, formattedValue: '$2.4M', industryValue: 260, formattedIndustry: '$260K', roi: '+880%', desc: 'Enterprise automated growth engine' },
      { label: 'Year 3 (Apex)', quarter: 'Y3', value: 5800, formattedValue: '$5.8M', industryValue: 480, formattedIndustry: '$480K', roi: '+1420%', desc: 'Category-defining global expansion' },
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
    quarterly: [
      { label: 'Audit', quarter: 'Q1', value: 2.4, formattedValue: '2.4x', industryValue: 1.8, formattedIndustry: '1.8x', roi: '+33% Lead', desc: 'Eliminating budget leaks & audience recalibration' },
      { label: 'Creative', quarter: 'Q2', value: 6.2, formattedValue: '6.2x', industryValue: 2.1, formattedIndustry: '2.1x', roi: '+195% Lead', desc: 'High-converting UGC & cinematic visual ad sprints' },
      { label: 'Modeling', quarter: 'Q3', value: 9.8, formattedValue: '9.8x', industryValue: 2.3, formattedIndustry: '2.3x', roi: '+326% Lead', desc: 'Proprietary intent modeling & micro-segmentation' },
      { label: 'Omni', quarter: 'Q4', value: 12.6, formattedValue: '12.6x', industryValue: 2.4, formattedIndustry: '2.4x', roi: '+425% Lead', desc: 'Cross-platform conversion triggers & dynamic retargeting' },
      { label: 'Apex', quarter: 'Apex', value: 14.8, formattedValue: '14.8x', industryValue: 2.5, formattedIndustry: '2.5x', roi: '+492% Lead', desc: 'Algorithmic ROAS compounding across Google & Meta' },
    ],
    monthly: [
      { label: 'M1', quarter: 'M1', value: 2.1, formattedValue: '2.1x', industryValue: 1.7, formattedIndustry: '1.7x', roi: '+23%', desc: 'Leakage plug' },
      { label: 'M2', quarter: 'M2', value: 2.4, formattedValue: '2.4x', industryValue: 1.8, formattedIndustry: '1.8x', roi: '+33%', desc: 'Audience testing' },
      { label: 'M3', quarter: 'M3', value: 4.1, formattedValue: '4.1x', industryValue: 1.9, formattedIndustry: '1.9x', roi: '+115%', desc: 'Ad creative ignition' },
      { label: 'M4', quarter: 'M4', value: 6.2, formattedValue: '6.2x', industryValue: 2.0, formattedIndustry: '2.0x', roi: '+210%', desc: 'Hook rate doubled' },
      { label: 'M5', quarter: 'M5', value: 8.0, formattedValue: '8.0x', industryValue: 2.1, formattedIndustry: '2.1x', roi: '+280%', desc: 'Bid multipliers' },
      { label: 'M6', quarter: 'M6', value: 9.8, formattedValue: '9.8x', industryValue: 2.2, formattedIndustry: '2.2x', roi: '+345%', desc: 'Conversion APIs live' },
      { label: 'M7', quarter: 'M7', value: 11.2, formattedValue: '11.2x', industryValue: 2.3, formattedIndustry: '2.3x', roi: '+386%', desc: 'First-party pixels' },
      { label: 'M8', quarter: 'M8', value: 12.6, formattedValue: '12.6x', industryValue: 2.3, formattedIndustry: '2.3x', roi: '+447%', desc: 'Retargeting cadence' },
      { label: 'M9', quarter: 'M9', value: 13.4, formattedValue: '13.4x', industryValue: 2.4, formattedIndustry: '2.4x', roi: '+458%', desc: 'Search synergy' },
      { label: 'M10', quarter: 'M10', value: 14.1, formattedValue: '14.1x', industryValue: 2.4, formattedIndustry: '2.4x', roi: '+487%', desc: 'Micro-demographics' },
      { label: 'M11', quarter: 'M11', value: 14.5, formattedValue: '14.5x', industryValue: 2.5, formattedIndustry: '2.5x', roi: '+480%', desc: 'Scale stability' },
      { label: 'M12 Apex', quarter: 'Apex', value: 14.8, formattedValue: '14.8x', industryValue: 2.5, formattedIndustry: '2.5x', roi: '+492%', desc: 'Maximum capital efficiency' },
    ],
    projection: [
      { label: 'Current', quarter: 'Now', value: 14.8, formattedValue: '14.8x', industryValue: 2.5, formattedIndustry: '2.5x', roi: '+492%', desc: 'Current apex benchmark' },
      { label: 'Target Y2', quarter: 'Y2', value: 18.2, formattedValue: '18.2x', industryValue: 2.8, formattedIndustry: '2.8x', roi: '+550%', desc: 'Multi-platform algorithmic synergy' },
      { label: 'Target Y3', quarter: 'Y3', value: 21.5, formattedValue: '21.5x', industryValue: 3.0, formattedIndustry: '3.0x', roi: '+616%', desc: 'Self-optimizing customer generation' },
    ],
  },
  conv: {
    name: 'Conversion Velocity',
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
    quarterly: [
      { label: 'Speed', quarter: 'Q1', value: 1.5, formattedValue: '1.5%', industryValue: 1.2, formattedIndustry: '1.2%', roi: '+25% Gain', desc: 'Page load accelerated to <0.6s & mobile friction reduced' },
      { label: 'Trust', quarter: 'Q2', value: 3.6, formattedValue: '3.6%', industryValue: 1.5, formattedIndustry: '1.5%', roi: '+140% Gain', desc: 'Live verification widgets & high-trust architecture' },
      { label: 'Checkout', quarter: 'Q3', value: 6.1, formattedValue: '6.1%', industryValue: 1.7, formattedIndustry: '1.7%', roi: '+258% Gain', desc: 'Frictionless checkout flow & dynamic pricing triggers' },
      { label: 'Predictive', quarter: 'Q4', value: 8.2, formattedValue: '8.2%', industryValue: 1.9, formattedIndustry: '1.9%', roi: '+331% Gain', desc: 'Dynamic landing page matching & copy personalization' },
      { label: 'Apex', quarter: 'Apex', value: 9.6, formattedValue: '9.6%', industryValue: 2.0, formattedIndustry: '2.0%', roi: '+380% Gain', desc: 'Industry-shattering 9.6% conversion velocity' },
    ],
    monthly: [
      { label: 'M1', quarter: 'M1', value: 1.3, formattedValue: '1.3%', industryValue: 1.1, formattedIndustry: '1.1%', roi: '+18%', desc: 'Latency compression' },
      { label: 'M2', quarter: 'M2', value: 1.5, formattedValue: '1.5%', industryValue: 1.2, formattedIndustry: '1.2%', roi: '+25%', desc: 'Mobile UX cleanup' },
      { label: 'M3', quarter: 'M3', value: 2.4, formattedValue: '2.4%', industryValue: 1.3, formattedIndustry: '1.3%', roi: '+84%', desc: 'Social proof modules' },
      { label: 'M4', quarter: 'M4', value: 3.6, formattedValue: '3.6%', industryValue: 1.4, formattedIndustry: '1.4%', roi: '+157%', desc: 'Form field minimization' },
      { label: 'M5', quarter: 'M5', value: 4.9, formattedValue: '4.9%', industryValue: 1.5, formattedIndustry: '1.5%', roi: '+226%', desc: '1-click checkout' },
      { label: 'M6', quarter: 'M6', value: 6.1, formattedValue: '6.1%', industryValue: 1.6, formattedIndustry: '1.6%', roi: '+281%', desc: 'Exit intent offers' },
      { label: 'M7', quarter: 'M7', value: 7.2, formattedValue: '7.2%', industryValue: 1.7, formattedIndustry: '1.7%', roi: '+323%', desc: 'Sticky CTA triggers' },
      { label: 'M8', quarter: 'M8', value: 8.2, formattedValue: '8.2%', industryValue: 1.8, formattedIndustry: '1.8%', roi: '+355%', desc: 'Variant testing winner' },
      { label: 'M9', quarter: 'M9', value: 8.8, formattedValue: '8.8%', industryValue: 1.8, formattedIndustry: '1.8%', roi: '+388%', desc: 'Urgency countdown' },
      { label: 'M10', quarter: 'M10', value: 9.1, formattedValue: '9.1%', industryValue: 1.9, formattedIndustry: '1.9%', roi: '+378%', desc: 'Cart recovery push' },
      { label: 'M11', quarter: 'M11', value: 9.4, formattedValue: '9.4%', industryValue: 1.9, formattedIndustry: '1.9%', roi: '+394%', desc: 'Trust badge testing' },
      { label: 'M12 Apex', quarter: 'Apex', value: 9.6, formattedValue: '9.6%', industryValue: 2.0, formattedIndustry: '2.0%', roi: '+380%', desc: 'Peak conversion flow' },
    ],
    projection: [
      { label: 'Baseline', quarter: 'Q1', value: 1.5, formattedValue: '1.5%', industryValue: 1.2, formattedIndustry: '1.2%', roi: '+25%', desc: 'Before optimization' },
      { label: 'Current Apex', quarter: 'Apex', value: 9.6, formattedValue: '9.6%', industryValue: 2.0, formattedIndustry: '2.0%', roi: '+380%', desc: 'Optimized conversion rate' },
      { label: 'Target Y2', quarter: 'Y2', value: 12.4, formattedValue: '12.4%', industryValue: 2.2, formattedIndustry: '2.2%', roi: '+463%', desc: 'AI personalized landing experiences' },
    ],
  },
  pipeline: {
    name: 'Pipeline Generated',
    unit: '$',
    badge: '$3.4M+ Pipeline',
    peak: '$3.4M Value',
    yMin: 0,
    yMax: 3800,
    yTicks: [
      { val: 0, label: '$0' },
      { val: 800, label: '$800K' },
      { val: 1800, label: '$1.8M' },
      { val: 2800, label: '$2.8M' },
      { val: 3400, label: '$3.4M' },
    ],
    quarterly: [
      { label: 'Q1 Setup', quarter: 'Q1', value: 120, formattedValue: '$120K', industryValue: 60, formattedIndustry: '$60K', roi: '+100%', desc: 'Inbound booking calendar & lead qualifying' },
      { label: 'Q2 Nurture', quarter: 'Q2', value: 380, formattedValue: '$380K', industryValue: 140, formattedIndustry: '$140K', roi: '+171%', desc: 'Automated calendar sync & email drip sequence' },
      { label: 'Q3 Velocity', quarter: 'Q3', value: 890, formattedValue: '$890K', industryValue: 260, formattedIndustry: '$260K', roi: '+242%', desc: 'High-ticket inbound qualification & retargeting' },
      { label: 'Q4 Enterprise', quarter: 'Q4', value: 1850, formattedValue: '$1.85M', industryValue: 420, formattedIndustry: '$420K', roi: '+340%', desc: 'B2B executive pitch presentations & inbound leads' },
      { label: 'Apex Wave', quarter: 'Apex', value: 3400, formattedValue: '$3.4M+', industryValue: 680, formattedIndustry: '$680K', roi: '+400%', desc: 'Predictable high-ticket customer acquisition machine' },
    ],
    monthly: [
      { label: 'M1', quarter: 'M1', value: 80, formattedValue: '$80K', industryValue: 40, formattedIndustry: '$40K', roi: '+100%', desc: 'Lead capture form live' },
      { label: 'M2', quarter: 'M2', value: 120, formattedValue: '$120K', industryValue: 60, formattedIndustry: '$60K', roi: '+100%', desc: 'Calendar scheduling integration' },
      { label: 'M3', quarter: 'M3', value: 240, formattedValue: '$240K', industryValue: 90, formattedIndustry: '$90K', roi: '+166%', desc: 'Pre-call qualification forms' },
      { label: 'M4', quarter: 'M4', value: 380, formattedValue: '$380K', industryValue: 140, formattedIndustry: '$140K', roi: '+171%', desc: 'Email automation trigger' },
      { label: 'M5', quarter: 'M5', value: 590, formattedValue: '$590K', industryValue: 190, formattedIndustry: '$190K', roi: '+210%', desc: 'Warm lead reactivation' },
      { label: 'M6', quarter: 'M6', value: 890, formattedValue: '$890K', industryValue: 260, formattedIndustry: '$260K', roi: '+242%', desc: 'High-ticket video proof' },
      { label: 'M7', quarter: 'M7', value: 1300, formattedValue: '$1.3M', industryValue: 330, formattedIndustry: '$330K', roi: '+293%', desc: 'B2B account targeting' },
      { label: 'M8', quarter: 'M8', value: 1850, formattedValue: '$1.85M', industryValue: 420, formattedIndustry: '$420K', roi: '+340%', desc: 'Decision-maker retargeting' },
      { label: 'M9', quarter: 'M9', value: 2300, formattedValue: '$2.3M', industryValue: 500, formattedIndustry: '$500K', roi: '+360%', desc: 'Enterprise expansion' },
      { label: 'M10', quarter: 'M10', value: 2800, formattedValue: '$2.8M', industryValue: 580, formattedIndustry: '$580K', roi: '+382%', desc: 'Multi-brand referrals' },
      { label: 'M11', quarter: 'M11', value: 3150, formattedValue: '$3.15M', industryValue: 640, formattedIndustry: '$640K', roi: '+392%', desc: 'Annual contract value boost' },
      { label: 'M12 Apex', quarter: 'Apex', value: 3400, formattedValue: '$3.4M+', industryValue: 680, formattedIndustry: '$680K', roi: '+400%', desc: 'Apex inbound pipeline closed' },
    ],
    projection: [
      { label: 'Year 1', quarter: 'Y1', value: 3400, formattedValue: '$3.4M', industryValue: 680, formattedIndustry: '$680K', roi: '+400%', desc: 'Closed agency pipeline' },
      { label: 'Year 2 (Est)', quarter: 'Y2', value: 9200, formattedValue: '$9.2M', industryValue: 1400, formattedIndustry: '$1.4M', roi: '+557%', desc: 'Global multi-channel inbound' },
      { label: 'Year 3 (Apex)', quarter: 'Y3', value: 18500, formattedValue: '$18.5M', industryValue: 2800, formattedIndustry: '$2.8M', roi: '+560%', desc: 'Enterprise syndicate scale' },
    ],
  },
};

// Particle interface for canvas ambient embers
interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export const ThreeGrowthModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [activeMetric, setActiveMetric] = useState<MetricType>('arr');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('spline');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('quarterly');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Animation values stored in refs for 60fps performance
  const animProgressRef = useRef(0);
  const scanlineXRef = useRef(0);
  const photonPosRef = useRef(0);
  const waveTimeRef = useRef(0);
  const radarAngleRef = useRef(0);
  const orbitAngleRef = useRef(0);
  const particlesRef = useRef<SparkParticle[]>([]);

  // Synchronized state refs for render loop
  const chartStyleRef = useRef(chartStyle);
  chartStyleRef.current = chartStyle;

  const metricRef = useRef(activeMetric);
  metricRef.current = activeMetric;

  const horizonRef = useRef(timeHorizon);
  horizonRef.current = timeHorizon;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentDataset = useMemo(() => DATASETS[activeMetric], [activeMetric]);
  const activeDataList = useMemo(() => {
    return currentDataset[timeHorizon] || currentDataset.quarterly;
  }, [currentDataset, timeHorizon]);

  // Trigger draw-in wave animation
  const triggerReplay = () => {
    animProgressRef.current = 0;
    particlesRef.current = [];
  };

  // Setup Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    animProgressRef.current = 0;

    // Initialize 24 ambient spark particles
    particlesRef.current = Array.from({ length: 24 }).map(() => ({
      x: Math.random() * 400,
      y: Math.random() * 260,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      alpha: Math.random(),
      color: Math.random() > 0.5 ? '#8B5CF6' : '#22D3EE',
      life: Math.random() * 100,
      maxLife: 60 + Math.random() * 80,
    }));

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

      // Increment animation clocks
      if (animProgressRef.current < 1) {
        animProgressRef.current += 0.045;
        if (animProgressRef.current > 1) animProgressRef.current = 1;
      }

      if (isPlayingRef.current) {
        waveTimeRef.current += 0.035;
        scanlineXRef.current = (scanlineXRef.current + 0.005) % 1;
        photonPosRef.current = (photonPosRef.current + 0.008) % 1;
        radarAngleRef.current = (radarAngleRef.current + 0.02) % (Math.PI * 2);
        orbitAngleRef.current = (orbitAngleRef.current + 0.007) % (Math.PI * 2);
      }

      const currentStyle = chartStyleRef.current;
      const dataset = DATASETS[metricRef.current];
      const data = dataset[horizonRef.current] || dataset.quarterly;

      // ----------------------------------------------------
      // Background Cyber Mesh & Radial Glow
      // ----------------------------------------------------
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      bgGrad.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
      bgGrad.addColorStop(0.55, 'rgba(16, 14, 28, 0.65)');
      bgGrad.addColorStop(1, 'rgba(10, 10, 18, 0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid Pattern with Matrix Dots
      const gridSpacing = 28;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let gx = 10; gx < width; gx += gridSpacing) {
        for (let gy = 10; gy < height; gy += gridSpacing) {
          ctx.fillRect(gx, gy, 1.2, 1.2);
        }
      }

      // ====================================================
      // 1. NEON FLUID SPLINE GRAPH (With Wave Breathing & Lasers)
      // ====================================================
      if (currentStyle === 'spline') {
        const padLeft = 44;
        const padRight = 24;
        const padTop = 32;
        const padBottom = 34;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const yMin = dataset.yMin;
        const yMax = dataset.yMax;

        // Draw Horizontal Grid lines with glowing ticks
        dataset.yTicks.forEach((tick) => {
          const normY = (tick.val - yMin) / (yMax - yMin);
          const y = padTop + plotH - normY * plotH;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(padLeft, y);
          ctx.lineTo(width - padRight, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
          ctx.font = '10px "Space Grotesk", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(tick.label, padLeft - 8, y);
        });

        // Holographic Sweeping Laser Scanner
        if (isPlayingRef.current) {
          const scanX = padLeft + scanlineXRef.current * plotW;
          const scanGrad = ctx.createLinearGradient(scanX - 25, 0, scanX + 25, 0);
          scanGrad.addColorStop(0, 'rgba(139, 92, 246, 0.0)');
          scanGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.18)');
          scanGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
          ctx.fillStyle = scanGrad;
          ctx.fillRect(scanX - 25, padTop, 50, plotH);

          ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(scanX, padTop);
          ctx.lineTo(scanX, padTop + plotH);
          ctx.stroke();
        }

        // Calculate Data Points with Wave Breathing Motion
        const points: { x: number; y: number; data: DataPoint }[] = [];
        const industryPoints: { x: number; y: number }[] = [];

        data.forEach((item, i) => {
          const x = padLeft + (i / (data.length - 1)) * plotW;
          const normVal = (item.value - yMin) / (yMax - yMin);
          const ease = Math.min(1, animProgressRef.current * (1 + (i / data.length) * 0.25));

          // Organic gentle wave breathing animation
          const wave = isPlayingRef.current
            ? Math.sin(waveTimeRef.current * 2 + i * 0.85) * (3.5 * ease)
            : 0;

          const y = padTop + plotH - (normVal * plotH * ease) + wave;
          points.push({ x, y, data: item });

          const normInd = (item.industryValue - yMin) / (yMax - yMin);
          const indY = padTop + plotH - (normInd * plotH * ease);
          industryPoints.push({ x, y: indY });
        });

        // 1. Industry Benchmark Comparison Line (Dashed red/amber line)
        if (industryPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(industryPoints[0].x, industryPoints[0].y);
          for (let i = 0; i < industryPoints.length - 1; i++) {
            const xc = (industryPoints[i].x + industryPoints[i + 1].x) / 2;
            const yc = (industryPoints[i].y + industryPoints[i + 1].y) / 2;
            ctx.quadraticCurveTo(industryPoints[i].x, industryPoints[i].y, xc, yc);
          }
          ctx.lineTo(industryPoints[industryPoints.length - 1].x, industryPoints[industryPoints.length - 1].y);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.font = '9px "Space Grotesk", monospace';
          ctx.textAlign = 'right';
          ctx.fillText('Industry Avg', industryPoints[industryPoints.length - 1].x - 6, industryPoints[industryPoints.length - 1].y - 8);
        }

        // 2. Glowing Area Fill Gradient
        if (points.length > 1) {
          const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
          areaGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
          areaGrad.addColorStop(0.45, 'rgba(34, 211, 238, 0.2)');
          areaGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

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

          // 3. Multi-Layer Neon Spline Curve (Glow + Core)
          const strokeGrad = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
          strokeGrad.addColorStop(0, '#8B5CF6');
          strokeGrad.addColorStop(0.5, '#A78BFA');
          strokeGrad.addColorStop(1, '#22D3EE');

          // Outer Glow
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
          ctx.lineWidth = 4;
          ctx.shadowColor = '#8B5CF6';
          ctx.shadowBlur = 18;
          ctx.stroke();

          // High-Intensity Core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.shadowColor = '#22D3EE';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // 4. Trailing Multi-Photon Energy Train
        if (points.length > 1 && isPlayingRef.current) {
          const t = photonPosRef.current;
          const totalSegments = points.length - 1;

          // Draw 4 trailing photon tail particles
          for (let trail = 0; trail < 4; trail++) {
            const trailOffset = (trail * 0.015);
            let trailT = (t - trailOffset + 1) % 1;

            const seg = Math.min(Math.floor(trailT * totalSegments), totalSegments - 1);
            const segT = (trailT * totalSegments) - seg;

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

            const alpha = 1 - (trail * 0.22);
            const radius = Math.max(1.5, 4.5 - trail * 0.9);

            ctx.fillStyle = trail === 0 ? '#ffffff' : '#22D3EE';
            ctx.shadowColor = '#8B5CF6';
            ctx.shadowBlur = trail === 0 ? 18 : 8;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();

            if (trail === 0) {
              ctx.strokeStyle = '#8B5CF6';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(px, py, radius + 3, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.shadowBlur = 0;
          }
        }

        // 5. Ambient Luminous Ember Sparks (Rise from Apex)
        if (isPlayingRef.current && points.length > 0) {
          const apexPt = points[points.length - 1];
          particlesRef.current.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life += 1;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);

            // Recycle particle
            if (p.life >= p.maxLife || p.y < padTop - 10) {
              p.x = apexPt.x + (Math.random() - 0.7) * 45;
              p.y = apexPt.y + (Math.random() - 0.5) * 20;
              p.life = 0;
              p.vy = -0.4 - Math.random() * 0.6;
              p.vx = (Math.random() - 0.5) * 0.6;
            }

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.8;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          });
        }

        // 6. X-Axis Labels, Droplines, & Milestone Pulsing Nodes
        points.forEach((pt, i) => {
          const isHovered = hoveredIndex === i;
          const isPeak = i === points.length - 1;

          // X-Axis Text
          ctx.fillStyle = isHovered ? '#8B5CF6' : 'rgba(255, 255, 255, 0.55)';
          ctx.font = isHovered ? 'bold 10px "Space Grotesk", monospace' : '10px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(pt.data.label, pt.x, height - 12);

          // Vertical Laser Dropline on Hover or Peak
          if (isHovered || isPeak) {
            ctx.strokeStyle = isHovered ? 'rgba(139, 92, 246, 0.5)' : 'rgba(34, 211, 238, 0.35)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x, padTop + plotH);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Concentric Animated Ripple Shockwave at Apex or Hovered Node
          if (isPeak || isHovered) {
            const ripplePhase = (waveTimeRef.current * 1.5 + (isHovered ? 0 : 1)) % 1;
            const rippleRadius = 6 + ripplePhase * 16;
            const rippleAlpha = 1 - ripplePhase;

            ctx.strokeStyle = isHovered ? `rgba(139, 92, 246, ${rippleAlpha * 0.8})` : `rgba(34, 211, 238, ${rippleAlpha * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Node Center Disc
          ctx.fillStyle = isPeak ? '#22D3EE' : (isHovered ? '#8B5CF6' : '#141424');
          ctx.strokeStyle = isPeak ? '#ffffff' : (isHovered ? '#22D3EE' : '#8B5CF6');
          ctx.lineWidth = isHovered || isPeak ? 2.5 : 1.5;

          ctx.shadowColor = isPeak ? '#22D3EE' : '#8B5CF6';
          ctx.shadowBlur = isHovered || isPeak ? 16 : 8;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isHovered ? 6.5 : (isPeak ? 5.5 : 4), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Apex ROI Badge Floating Label
          if (isPeak && !isHovered) {
            ctx.fillStyle = '#8B5CF6';
            ctx.font = 'bold 9px "Space Grotesk", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(pt.data.roi, pt.x, pt.y - 14);
          }
        });
      }

      // ====================================================
      // 2. DUAL COMPARATIVE CYBER BARS (With Animated Equalizer Charge)
      // ====================================================
      else if (currentStyle === 'bars') {
        const padLeft = 44;
        const padRight = 24;
        const padTop = 32;
        const padBottom = 34;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const yMin = dataset.yMin;
        const yMax = dataset.yMax;

        // Grid lines
        dataset.yTicks.forEach((tick) => {
          const normY = (tick.val - yMin) / (yMax - yMin);
          const y = padTop + plotH - normY * plotH;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(padLeft, y);
          ctx.lineTo(width - padRight, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
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

          // 1. Industry Bar (dimmed gray/red reference)
          const normInd = (item.industryValue - yMin) / (yMax - yMin);
          const indBarH = normInd * plotH * animProgressRef.current;
          const indX = centerX - barW - gap / 2;
          const indY = padTop + plotH - indBarH;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(indX, indY, barW, indBarH, [4, 4, 0, 0]);
          ctx.fill();

          // 2. Growzen Bar (Glowing Violet/Cyan with Shimmer Charge)
          const normVal = (item.value - yMin) / (yMax - yMin);
          const growBarH = normVal * plotH * animProgressRef.current;
          const growX = centerX + gap / 2;
          const growY = padTop + plotH - growBarH;

          const barGrad = ctx.createLinearGradient(0, growY, 0, padTop + plotH);
          barGrad.addColorStop(0, isHovered ? '#22D3EE' : '#8B5CF6');
          barGrad.addColorStop(0.65, '#6D28D9');
          barGrad.addColorStop(1, 'rgba(139, 92, 246, 0.15)');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(growX, growY, barW, growBarH, [4, 4, 0, 0]);
          ctx.fill();

          // Segmented LED notch lines across bar
          const notchCount = Math.floor(growBarH / 10);
          for (let n = 1; n < notchCount; n++) {
            const ny = padTop + plotH - n * 10;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(growX, ny, barW, 1.5);
          }

          // Glowing Cap on Growzen Bar
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = isHovered ? '#22D3EE' : '#8B5CF6';
          ctx.shadowBlur = 14;
          ctx.fillRect(growX, growY, barW, 3);
          ctx.shadowBlur = 0;

          // Value on top of Growzen Bar
          ctx.fillStyle = isHovered ? '#22D3EE' : 'rgba(255, 255, 255, 0.95)';
          ctx.font = 'bold 9px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(item.formattedValue, growX + barW / 2, growY - 6);

          // X-Axis Label
          ctx.fillStyle = isHovered ? '#8B5CF6' : 'rgba(255, 255, 255, 0.55)';
          ctx.font = isHovered ? 'bold 10px "Space Grotesk", monospace' : '10px "Space Grotesk", monospace';
          ctx.fillText(item.quarter, centerX, height - 12);
        });

        // Legend in top-right
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(width - 150, 10, 8, 8);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px "Space Grotesk", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Industry', width - 138, 17);

        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(width - 80, 10, 8, 8);
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText('Growzen', width - 68, 17);
      }

      // ====================================================
      // 3. HEXAGONAL PERFORMANCE RADAR WEB (With Rotating Scanner)
      // ====================================================
      else if (currentStyle === 'radar') {
        const cx = width * 0.48;
        const cy = height * 0.52;
        const maxRadius = Math.min(width * 0.34, height * 0.38);
        const sides = RADAR_PILLARS.length;

        // Concentric Web Grid Rings (25%, 50%, 75%, 100%)
        const rings = [0.25, 0.5, 0.75, 1.0];
        rings.forEach((scale) => {
          ctx.beginPath();
          for (let s = 0; s < sides; s++) {
            const angle = (s / sides) * Math.PI * 2 - Math.PI / 2;
            const r = maxRadius * scale;
            const rx = cx + Math.cos(angle) * r;
            const ry = cy + Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.strokeStyle = scale === 1.0 ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = scale === 1.0 ? 1.5 : 1;
          ctx.stroke();
        });

        // Radial Axis Spokes
        for (let s = 0; s < sides; s++) {
          const angle = (s / sides) * Math.PI * 2 - Math.PI / 2;
          const rx = cx + Math.cos(angle) * maxRadius;
          const ry = cy + Math.sin(angle) * maxRadius;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rx, ry);
          ctx.stroke();

          // Axis Labels outside
          const labelDist = maxRadius + 18;
          const lx = cx + Math.cos(angle) * labelDist;
          const ly = cy + Math.sin(angle) * labelDist;
          const pillar = RADAR_PILLARS[s];
          const isHovered = hoveredIndex === s;

          ctx.fillStyle = isHovered ? '#22D3EE' : 'rgba(255, 255, 255, 0.75)';
          ctx.font = isHovered ? 'bold 9px "Space Grotesk", monospace' : '9px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pillar.axis, lx, ly);
        }

        // Animated Rotating Radar Beam Sweep
        if (isPlayingRef.current) {
          const beamAngle = radarAngleRef.current;
          const sweepGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
          sweepGrad.addColorStop(0, 'rgba(34, 211, 238, 0.25)');
          sweepGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, maxRadius, beamAngle - 0.45, beamAngle);
          ctx.closePath();
          ctx.fillStyle = sweepGrad;
          ctx.fill();

          // Leading Laser Line
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(beamAngle) * maxRadius, cy + Math.sin(beamAngle) * maxRadius);
          ctx.stroke();
        }

        // Industry Benchmark Web (Dimmed)
        ctx.beginPath();
        RADAR_PILLARS.forEach((p, idx) => {
          const angle = (idx / sides) * Math.PI * 2 - Math.PI / 2;
          const r = (p.industry / 100) * maxRadius * animProgressRef.current;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Growzen High-Impact Polygon Web
        const growzenPoints: { x: number; y: number }[] = [];
        ctx.beginPath();
        RADAR_PILLARS.forEach((p, idx) => {
          const angle = (idx / sides) * Math.PI * 2 - Math.PI / 2;
          const r = (p.growzen / 100) * maxRadius * animProgressRef.current;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          growzenPoints.push({ x: px, y: py });
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        const radarFill = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
        radarFill.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
        radarFill.addColorStop(1, 'rgba(34, 211, 238, 0.18)');
        ctx.fillStyle = radarFill;
        ctx.fill();

        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vertices nodes
        growzenPoints.forEach((pt, idx) => {
          const isHovered = hoveredIndex === idx;
          ctx.fillStyle = isHovered ? '#ffffff' : '#22D3EE';
          ctx.shadowColor = '#22D3EE';
          ctx.shadowBlur = isHovered ? 16 : 8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isHovered ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // ====================================================
      // 4. ATTRIBUTION ORBIT (With Rotating Satellite Rings)
      // ====================================================
      else if (currentStyle === 'orbit') {
        const cx = width * 0.38;
        const cy = height * 0.5;
        const radius = Math.min(width * 0.28, height * 0.38);
        const innerRadius = radius * 0.62;

        let startAngle = orbitAngleRef.current;
        const total = CHANNELS.reduce((acc, c) => acc + c.share, 0);

        // Draw Slices
        CHANNELS.forEach((channel, idx) => {
          const sliceAngle = (channel.share / total) * Math.PI * 2;
          const endAngle = startAngle + sliceAngle;
          const isHovered = hoveredIndex === idx;
          const radOffset = isHovered ? 8 : 0;

          const midAngle = startAngle + sliceAngle / 2;
          const shiftX = Math.cos(midAngle) * radOffset;
          const shiftY = Math.sin(midAngle) * radOffset;

          ctx.beginPath();
          ctx.arc(cx + shiftX, cy + shiftY, radius, startAngle, endAngle);
          ctx.arc(cx + shiftX, cy + shiftY, innerRadius, endAngle, startAngle, true);
          ctx.closePath();

          ctx.fillStyle = channel.color;
          ctx.shadowColor = channel.color;
          ctx.shadowBlur = isHovered ? 22 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          startAngle = endAngle;
        });

        // Center Reactor Core
        ctx.fillStyle = '#0E0E18';
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pulsing core text
        ctx.fillStyle = '#8B5CF6';
        ctx.font = 'bold 13px "Space Grotesk", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+450%', cx, cy - 8);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '9px "Space Grotesk", monospace';
        ctx.fillText('APEX ROI', cx, cy + 9);

        // Right-Hand Channel Attribution Breakdown List
        const legendX = width * 0.70;
        const legendStartY = height * 0.20;
        const rowHeight = (height * 0.60) / CHANNELS.length;

        CHANNELS.forEach((ch, idx) => {
          const y = legendStartY + idx * rowHeight;
          const isHovered = hoveredIndex === idx;

          // Color indicator box
          ctx.fillStyle = ch.color;
          ctx.shadowColor = ch.color;
          ctx.shadowBlur = isHovered ? 12 : 0;
          ctx.beginPath();
          ctx.roundRect(legendX - 22, y - 6, 12, 12, 3);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Channel Name
          ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.88)';
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
  }, [activeMetric, chartStyle, timeHorizon, isPlaying, hoveredIndex]);

  // Pointer movement handling for interactive HUD targeting
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

    if (chartStyle === 'orbit') {
      const cx = rect.width * 0.38;
      const cy = rect.height * 0.5;
      const dist = Math.hypot(relX - cx, relY - cy);
      const radius = Math.min(rect.width * 0.28, rect.height * 0.38);
      if (dist >= radius * 0.45 && dist <= radius * 1.25) {
        let angle = Math.atan2(relY - cy, relX - cx) - orbitAngleRef.current;
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

    if (chartStyle === 'radar') {
      const cx = rect.width * 0.48;
      const cy = rect.height * 0.52;
      const sides = RADAR_PILLARS.length;
      let closestIdx: number | null = null;
      let minDist = 9999;

      for (let s = 0; s < sides; s++) {
        const angle = (s / sides) * Math.PI * 2 - Math.PI / 2;
        const r = (RADAR_PILLARS[s].growzen / 100) * Math.min(rect.width * 0.34, rect.height * 0.38);
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        const dist = Math.hypot(relX - px, relY - py);
        if (dist < minDist && dist < 50) {
          minDist = dist;
          closestIdx = s;
        }
      }
      setHoveredIndex(closestIdx);
      return;
    }

    // Spline & Bars Detection
    const padLeft = 44;
    const padRight = 24;
    const plotW = rect.width - padLeft - padRight;
    const dataLen = activeDataList.length;

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
      className="w-full min-h-[390px] sm:min-h-[420px] relative flex flex-col justify-between select-none overflow-hidden rounded-2xl bg-[#090910] border border-white/10 hover:border-[#8B5CF6]/50 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
      title="Growzen Growth Terminal: Interactive Performance Graph"
    >
      {/* 1. Top Cyber HUD Controls Bar */}
      <div className="w-full px-3.5 pt-3 pb-2.5 flex items-center justify-between z-20 gap-2 flex-wrap border-b border-white/5 bg-black/60 backdrop-blur-md">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#121220] p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveMetric('arr');
              triggerReplay();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              activeMetric === 'arr'
                ? 'bg-[#8B5CF6] text-white font-bold bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>ARR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMetric('roas');
              triggerReplay();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              activeMetric === 'roas'
                ? 'bg-[#8B5CF6] text-white font-bold bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>ROAS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMetric('conv');
              triggerReplay();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              activeMetric === 'conv'
                ? 'bg-[#8B5CF6] text-white font-bold bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>CVR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMetric('pipeline');
              triggerReplay();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              activeMetric === 'pipeline'
                ? 'bg-[#8B5CF6] text-white font-bold bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Pipeline</span>
          </button>
        </div>

        {/* Chart Style Switcher (Spline / Bars / Radar / Orbit) */}
        <div className="flex items-center gap-1 bg-black/75 p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => {
              setChartStyle('spline');
              triggerReplay();
            }}
            title="Fluid Spline Curve"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'spline'
                ? 'bg-white/20 text-[#22D3EE] font-bold border border-[#22D3EE]/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Spline</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartStyle('bars');
              triggerReplay();
            }}
            title="Comparative Cyber Bars"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'bars'
                ? 'bg-white/20 text-[#8B5CF6] font-bold border border-[#8B5CF6]/40 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Bars</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartStyle('radar');
              triggerReplay();
            }}
            title="Performance Radar Web"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'radar'
                ? 'bg-white/20 text-[#22D3EE] font-bold border border-[#22D3EE]/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Radar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartStyle('orbit');
              triggerReplay();
            }}
            title="Channel Attribution Orbit"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech flex items-center gap-1 transition-all cursor-pointer ${
              chartStyle === 'orbit'
                ? 'bg-white/20 text-[#A78BFA] font-bold border border-[#A78BFA]/40 shadow-[0_0_10px_rgba(167,139,250,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Orbit</span>
          </button>
        </div>

        {/* Animation Play/Pause & Replay Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause live wave animation' : 'Resume live wave animation'}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-[#22D3EE]" /> : <Play className="w-3 h-3 text-neutral-400" />}
          </button>

          <button
            type="button"
            onClick={triggerReplay}
            title="Replay wave surge animation"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#8B5CF6]" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Bar: Timeframe Horizon Filter (For Spline & Bars) */}
      {(chartStyle === 'spline' || chartStyle === 'bars') && (
        <div className="w-full px-3.5 py-1.5 flex items-center justify-between z-10 bg-black/30 border-b border-white/5 text-[9px] font-mono-tech text-neutral-400">
          <span className="flex items-center gap-1 text-neutral-400">
            <Layers className="w-2.5 h-2.5 text-[#8B5CF6]" />
            Trajectory Horizon:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('quarterly');
                triggerReplay();
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                timeHorizon === 'quarterly'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30'
                  : 'hover:text-white'
              }`}
            >
              Quarterly
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('monthly');
                triggerReplay();
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                timeHorizon === 'monthly'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30'
                  : 'hover:text-white'
              }`}
            >
              12-Month Surge
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('projection');
                triggerReplay();
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                timeHorizon === 'projection'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30'
                  : 'hover:text-white'
              }`}
            >
              3-Year Horizon
            </button>
          </div>
        </div>
      )}

      {/* 3. Interactive Canvas Graph Stage */}
      <div className="relative w-full flex-1 min-h-[260px] sm:min-h-[290px] overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Floating Cyber HUD Tooltip for Spline & Bars */}
        {(chartStyle === 'spline' || chartStyle === 'bars') && hoveredIndex !== null && activeDataList[hoveredIndex] && mousePos && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#10101c]/95 border border-[#8B5CF6] text-left font-mono-tech shadow-[0_0_30px_rgba(139,92,246,0.4)] backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-4 min-w-[200px]"
            style={{
              left: `${Math.max(105, Math.min(mousePos.x, (containerRef.current?.clientWidth || 340) - 105))}px`,
              top: `${Math.max(80, mousePos.y - 12)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-[#8B5CF6] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#22D3EE]" />
                {activeDataList[hoveredIndex].label}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold">
                {activeDataList[hoveredIndex].roi}
              </span>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Growzen Apex:</span>
                <span className="text-white font-bold text-[12px] text-[#22D3EE]">
                  {activeDataList[hoveredIndex].formattedValue}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Industry Avg:</span>
                <span className="text-neutral-400">
                  {activeDataList[hoveredIndex].formattedIndustry}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-neutral-300 leading-tight border-t border-white/10 pt-1.5">
              {activeDataList[hoveredIndex].desc}
            </p>
          </div>
        )}

        {/* Floating Tooltip for Radar Web */}
        {chartStyle === 'radar' && hoveredIndex !== null && RADAR_PILLARS[hoveredIndex] && mousePos && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#10101c]/95 border border-[#22D3EE] text-left font-mono-tech shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-4 min-w-[210px]"
            style={{
              left: `${Math.max(110, Math.min(mousePos.x, (containerRef.current?.clientWidth || 340) - 110))}px`,
              top: `${Math.max(80, mousePos.y - 12)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-[#22D3EE] flex items-center gap-1">
                <Radar className="w-3 h-3" />
                {RADAR_PILLARS[hoveredIndex].axis}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#22D3EE]/20 text-[#22D3EE] text-[10px] font-bold">
                {RADAR_PILLARS[hoveredIndex].metric}
              </span>
            </div>

            <div className="space-y-1 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-neutral-400">Growzen Score:</span>
                <span className="text-[#22D3EE] font-bold">{RADAR_PILLARS[hoveredIndex].growzen}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Industry Avg:</span>
                <span className="text-neutral-400">{RADAR_PILLARS[hoveredIndex].industry}%</span>
              </div>
            </div>

            <p className="text-[9px] text-neutral-300 leading-tight border-t border-white/10 pt-1.5">
              {RADAR_PILLARS[hoveredIndex].desc}
            </p>
          </div>
        )}

        {/* Initial Hover Prompt Pill */}
        {hoveredIndex === null && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[9px] font-mono-tech text-neutral-400 tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
            <span>
              {chartStyle === 'spline'
                ? 'Hover or drag spline curve to inspect milestones'
                : chartStyle === 'bars'
                ? 'Hover cyber bars to inspect vs industry'
                : chartStyle === 'radar'
                ? 'Hover radar vertices to view pillar benchmark'
                : 'Hover orbit slices for channel attribution'}
            </span>
          </div>
        )}
      </div>

      {/* 4. Bottom Live Performance Ribbon */}
      <div className="w-full px-3.5 py-2.5 flex items-center justify-between z-20 border-t border-white/10 text-[10px] font-mono-tech text-neutral-400 bg-black/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#22D3EE] animate-pulse" />
          <span className="text-white font-semibold">{currentDataset.name}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-[#8B5CF6] font-bold">{currentDataset.peak}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-400 hidden sm:inline-block">Status:</span>
          <div className="flex items-center gap-1.5 text-[#22D3EE] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
            <span>Live 60 FPS Telemetry</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </div>
        </div>
      </div>
    </div>
  );
};
