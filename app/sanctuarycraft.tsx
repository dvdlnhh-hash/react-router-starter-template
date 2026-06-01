import type { ReactNode, ElementType, FormEvent } from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, Palette, Calculator, Map, Plus,
  TrendingUp, Calendar, DollarSign, CheckCircle, Circle,
  Building, ChevronDown, ChevronUp, ChevronRight,
  Home, Sliders, MapPin, Star, Activity, BarChart2,
  Sparkles, Sun, Eye, Clock, Check, X,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'design' | 'budget' | 'roadmap';
type ProjectStatus = 'Planning' | 'In Progress' | 'Pre-Launch' | 'Live';

interface Project {
  id: number;
  name: string;
  theme: string;
  status: ProjectStatus;
  completion: number;
  totalBudget: number;
  nightlyRate: number;
  targetLaunch: string;
  location: string;
  beds: number;
  roiMonths: number;
  emoji: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface RoadmapPhase {
  id: number;
  name: string;
  description: string;
  accentColor: string;
  bgColor: string;
  items: ChecklistItem[];
}

interface BudgetState {
  acquisition: number;
  renovation: number;
  furniture: number;
  marketing: number;
  operatingMonthly: number;
}

interface Aesthetic {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  palette: string[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const AESTHETICS: Aesthetic[] = [
  {
    id: 'biophilic',
    name: 'Modern Biophilic',
    desc: 'Living walls, raw timber, organic forms — where inside meets wild.',
    emoji: '🌿',
    palette: ['#4d7c5e', '#8b6914', '#2d4a3e'],
  },
  {
    id: 'industrial',
    name: 'Industrial Cozy',
    desc: 'Raw steel, exposed brick, Edison bulbs and velvet. Bold contrast.',
    emoji: '🔩',
    palette: ['#7c5c3a', '#4a4a4a', '#c0793a'],
  },
  {
    id: 'nordic',
    name: 'Nordic Minimalist',
    desc: 'Muted tones, clean lines, functional beauty with cozy warmth.',
    emoji: '❄️',
    palette: ['#8fa4b2', '#c9c0b0', '#3d3d3d'],
  },
  {
    id: 'japandi',
    name: 'Japandi Zen',
    desc: 'Wabi-sabi imperfection meets Scandinavian craft. Restorative.',
    emoji: '🎋',
    palette: ['#7d7059', '#a89070', '#4a3f35'],
  },
  {
    id: 'coastal',
    name: 'Coastal Luxe',
    desc: 'Bleached wood, ocean tones, linen. Effortless sophistication.',
    emoji: '🌊',
    palette: ['#5b8fa8', '#c4b896', '#e8e0d0'],
  },
  {
    id: 'mountain',
    name: 'Mountain Chalet',
    desc: 'Dark firs, stone hearth, fur throws. Adventure meets refuge.',
    emoji: '🏔️',
    palette: ['#3a2e2a', '#6b4f3a', '#a07855'],
  },
];

const TEXTURES = [
  'Wood Slat Walls', 'Exposed Brick', 'Polished Concrete',
  'Rattan Panels', 'Linen Upholstery', 'Marble Surfaces',
  'Live-Edge Wood', 'Woven Jute', 'Venetian Plaster',
];

const LIGHTING_OPTIONS = [
  'Warm Ambient Glow', 'Directional Accent Spots', 'Task & Reading',
  'Statement Pendant', 'LED Cove Strips', 'Candlelight & Flame',
  'Maximized Natural Light', 'Dimmable Smart Scenes',
];

const FOCAL_POINTS = [
  'Statement Fireplace', 'Indoor Garden Wall',
  'Oversized Gallery Wall', 'Freestanding Soaking Tub',
  'Floor-to-Ceiling Windows', 'Custom Built-In Shelving',
  "Chef's Kitchen Island", 'Suspended Hammock Chair',
];

const AESTHETIC_OPENERS: Record<string, string> = {
  biophilic:
    'Step into a living sanctuary where raw timber and cascading greenery dissolve the boundary between indoors and wild. Every breath carries the scent of earth.',
  industrial:
    'Raw steel meets warm candlelight in this unapologetically bold retreat. Guests are drawn in by the tension between rugged materiality and plush comfort.',
  nordic:
    'Clean lines and hushed tones create a canvas of deliberate calm. Negative space becomes the luxury, and each object earns its place.',
  japandi:
    'A quiet dialogue between Japanese wabi-sabi and Scandinavian craft. The space honours imperfection — guests arrive rushed and leave restored.',
  coastal:
    'Salt air and bleached linen. The space unfolds like a deep exhale — unhurried, luminous, and effortlessly at ease with the light.',
  mountain:
    'Dark timbers rise against snow-capped silhouettes beyond the glass. The space commands presence without effort — primal, warm, and utterly still.',
};

function generateSummary(
  aestheticId: string,
  textures: string[],
  lighting: string[],
  focalPoints: string[]
): string {
  const opener = AESTHETIC_OPENERS[aestheticId] ?? 'An exceptional space awaits.';

  const texturePhrase =
    textures.length > 0
      ? `Grounded by ${textures.slice(0, 2).join(' and ').toLowerCase()}`
      : 'Grounded in tactile authenticity';

  const lightingPhrase =
    lighting.includes('Warm Ambient Glow') || lighting.includes('Candlelight & Flame')
      ? 'lit by a warm amber glow that shifts from golden afternoon to intimate evening'
      : lighting.length > 0
        ? `illuminated by ${lighting[0].toLowerCase()} that defines the mood`
        : 'thoughtfully illuminated at every hour';

  const focalPhrase =
    focalPoints.length > 0
      ? `anchored by ${focalPoints.slice(0, 2).join(' and ').toLowerCase()}`
      : 'anchored by carefully chosen focal moments';

  return `${opener} ${texturePhrase}, ${lightingPhrase}, and ${focalPhrase}. Guests will arrive as strangers to stillness and leave as devotees. This isn't just a rental — it's a narrative they'll want to return to, again and again.`;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'The Birchwood Retreat',
    theme: 'Modern Biophilic',
    status: 'In Progress',
    completion: 65,
    totalBudget: 85000,
    nightlyRate: 285,
    targetLaunch: '2025 Q3',
    location: 'Catskills, NY',
    beds: 3,
    roiMonths: 18,
    emoji: '🌿',
  },
  {
    id: 2,
    name: 'Ember & Stone Lodge',
    theme: 'Industrial Cozy',
    status: 'Planning',
    completion: 28,
    totalBudget: 120000,
    nightlyRate: 350,
    targetLaunch: '2025 Q4',
    location: 'Asheville, NC',
    beds: 4,
    roiMonths: 22,
    emoji: '🔩',
  },
  {
    id: 3,
    name: 'Nordic Pines Cabin',
    theme: 'Nordic Minimalist',
    status: 'Pre-Launch',
    completion: 92,
    totalBudget: 65000,
    nightlyRate: 220,
    targetLaunch: '2025 Q2',
    location: 'Stowe, VT',
    beds: 2,
    roiMonths: 15,
    emoji: '❄️',
  },
];

const INITIAL_PHASES: RoadmapPhase[] = [
  {
    id: 1,
    name: 'Concept & Legal',
    description: 'Define your vision and establish the legal foundation.',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    items: [
      { id: 'c1', text: 'Define property concept and aesthetic theme', completed: true },
      { id: 'c2', text: 'Research local short-term rental regulations', completed: true },
      { id: 'c3', text: 'Secure property lease or purchase agreement', completed: true },
      { id: 'c4', text: 'Register business entity (LLC or sole trader)', completed: false },
      { id: 'c5', text: 'Obtain STR permit and required licenses', completed: false },
      { id: 'c6', text: 'Set up dedicated business banking account', completed: false },
    ],
  },
  {
    id: 2,
    name: 'Renovation & Interior Styling',
    description: 'Transform the space from raw structure to lived-in sanctuary.',
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    items: [
      { id: 'r1', text: 'Engage interior designer or styling consultant', completed: true },
      { id: 'r2', text: 'Source and order all furniture & decor pieces', completed: false },
      { id: 'r3', text: 'Complete structural renovations and painting', completed: false },
      { id: 'r4', text: 'Install smart home systems & keyless entry', completed: false },
      { id: 'r5', text: 'Commission professional photography session', completed: false },
      { id: 'r6', text: 'Create guest welcome guide & house manual', completed: false },
    ],
  },
  {
    id: 3,
    name: 'SEO, Listings & Marketing',
    description: 'Tell your story and attract your ideal guests.',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    items: [
      { id: 'm1', text: 'Create optimized Airbnb and VRBO listings', completed: false },
      { id: 'm2', text: 'Build direct booking website or landing page', completed: false },
      { id: 'm3', text: 'Configure dynamic pricing tool (PriceLabs / Beyond)', completed: false },
      { id: 'm4', text: 'Launch Instagram and property social profiles', completed: false },
      { id: 'm5', text: 'Secure initial guest reviews via soft launch', completed: false },
      { id: 'm6', text: 'Submit to travel blogs and press for features', completed: false },
    ],
  },
  {
    id: 4,
    name: 'Operations & Launch',
    description: 'Go live and optimize your guest experience engine.',
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    items: [
      { id: 'o1', text: 'Set up automated guest messaging sequences', completed: false },
      { id: 'o2', text: 'Hire and onboard cleaning & maintenance team', completed: false },
      { id: 'o3', text: 'Stock and photograph welcome amenities basket', completed: false },
      { id: 'o4', text: 'Complete host test-stay and quality walkthrough', completed: false },
      { id: 'o5', text: 'Open calendar and accept first bookings', completed: false },
      { id: 'o6', text: 'Establish review monitoring and response workflow', completed: false },
    ],
  },
];

// ─── Utility Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Planning: 'bg-slate-700 text-slate-300',
    'In Progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'Pre-Launch': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    Live: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({
  value,
  color = 'amber',
  size = 'sm',
}: {
  value: number;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };
  const colors: Record<string, string> = {
    amber: 'bg-gradient-to-r from-amber-500 to-amber-400',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  };
  return (
    <div className={`w-full bg-slate-700/60 rounded-full ${heights[size]}`}>
      <div
        className={`${heights[size]} rounded-full transition-all duration-700 ease-out ${colors[color] ?? colors.amber}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ElementType;
  accent: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-600/60 transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-semibold text-slate-100 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────

function DashboardTab({
  projects,
  onAddProject,
  roadmapCompletion,
}: {
  projects: Project[];
  onAddProject: () => void;
  roadmapCompletion: number;
}) {
  const totalBudget = projects.reduce((s, p) => s + p.totalBudget, 0);
  const avgNightly = Math.round(projects.reduce((s, p) => s + p.nightlyRate, 0) / projects.length);
  const avgROI = Math.round(projects.reduce((s, p) => s + p.roiMonths, 0) / projects.length);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-1">Property Portfolio</h1>
          <p className="text-slate-400 text-sm">Manage your getaway concepts from vision to launch.</p>
        </div>
        <button
          onClick={onAddProject}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
        >
          <Plus className="w-4 h-4" />
          Add New Concept
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Portfolio Budget"
          value={`$${(totalBudget / 1000).toFixed(0)}k`}
          sub={`Across ${projects.length} properties`}
          icon={DollarSign}
          accent="bg-amber-500/15 text-amber-400"
        />
        <KPICard
          label="Avg Nightly Rate"
          value={`$${avgNightly}`}
          sub="Per night projected"
          icon={TrendingUp}
          accent="bg-emerald-500/15 text-emerald-400"
        />
        <KPICard
          label="Active Projects"
          value={`${projects.length}`}
          sub={`${projects.filter((p) => p.status === 'Live').length} live`}
          icon={Building}
          accent="bg-blue-500/15 text-blue-400"
        />
        <KPICard
          label="Avg ROI Timeline"
          value={`${avgROI}mo`}
          sub="Estimated break-even"
          icon={Calendar}
          accent="bg-purple-500/15 text-purple-400"
        />
      </div>

      {/* Roadmap Progress Banner */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5 mb-8 flex items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Launch Roadmap Progress</span>
            <span className="text-sm font-semibold text-amber-400">{roadmapCompletion}%</span>
          </div>
          <ProgressBar value={roadmapCompletion} color="amber" size="md" />
        </div>
        <button className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors whitespace-nowrap">
          View Roadmap <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors: Record<ProjectStatus, string> = {
    Planning: 'from-slate-700 to-slate-800',
    'In Progress': 'from-amber-900/30 to-slate-800',
    'Pre-Launch': 'from-blue-900/30 to-slate-800',
    Live: 'from-emerald-900/30 to-slate-800',
  };

  return (
    <div
      className={`bg-gradient-to-b ${statusColors[project.status]} border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/60 rounded-xl flex items-center justify-center text-xl">
            {project.emoji}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              {project.location}
            </div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
          <p className="text-base font-semibold text-slate-100">${project.nightlyRate}</p>
          <p className="text-xs text-slate-500 mt-0.5">/ night</p>
        </div>
        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
          <p className="text-base font-semibold text-slate-100">${(project.totalBudget / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-500 mt-0.5">budget</p>
        </div>
        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
          <p className="text-base font-semibold text-slate-100">{project.roiMonths}mo</p>
          <p className="text-xs text-slate-500 mt-0.5">ROI est.</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Completion</span>
          <span className="font-medium text-slate-300">{project.completion}%</span>
        </div>
        <ProgressBar value={project.completion} color="amber" />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Launch {project.targetLaunch}
        </span>
        <span className="flex items-center gap-1">
          <span>{project.beds}</span> beds · {project.theme}
        </span>
      </div>
    </div>
  );
}

// ─── Design Tab ────────────────────────────────────────────────────────────────

function DesignTab() {
  const [selectedAesthetic, setSelectedAesthetic] = useState<string>('biophilic');
  const [selectedTextures, setSelectedTextures] = useState<Set<string>>(
    new Set(['Wood Slat Walls', 'Linen Upholstery'])
  );
  const [selectedLighting, setSelectedLighting] = useState<Set<string>>(
    new Set(['Warm Ambient Glow', 'Statement Pendant'])
  );
  const [selectedFocals, setSelectedFocals] = useState<Set<string>>(
    new Set(['Statement Fireplace', 'Indoor Garden Wall'])
  );

  const toggle = useCallback((set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  }, []);

  const summary = useMemo(
    () =>
      generateSummary(
        selectedAesthetic,
        Array.from(selectedTextures),
        Array.from(selectedLighting),
        Array.from(selectedFocals)
      ),
    [selectedAesthetic, selectedTextures, selectedLighting, selectedFocals]
  );

  const currentAesthetic = AESTHETICS.find((a) => a.id === selectedAesthetic)!;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 mb-1">Design & Vibe Concept Board</h1>
        <p className="text-slate-400 text-sm">Define the aesthetic DNA of your sanctuary.</p>
      </div>

      {/* Aesthetic Selector */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Choose Your Aesthetic
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AESTHETICS.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAesthetic(a.id)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group ${
                selectedAesthetic === a.id
                  ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                  : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
              }`}
            >
              {selectedAesthetic === a.id && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-slate-950" />
                </div>
              )}
              <div className="text-2xl mb-2">{a.emoji}</div>
              <p
                className={`text-xs font-semibold leading-tight ${
                  selectedAesthetic === a.id ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {a.name}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden lg:block">{a.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Element Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <ChecklistGroup
          title="Textures & Materials"
          icon={<Layers className="w-4 h-4" />}
          items={TEXTURES}
          selected={selectedTextures}
          onToggle={(val) => toggle(selectedTextures, setSelectedTextures, val)}
        />
        <ChecklistGroup
          title="Lighting Palette"
          icon={<Sun className="w-4 h-4" />}
          items={LIGHTING_OPTIONS}
          selected={selectedLighting}
          onToggle={(val) => toggle(selectedLighting, setSelectedLighting, val)}
        />
        <ChecklistGroup
          title="Focal Points"
          icon={<Eye className="w-4 h-4" />}
          items={FOCAL_POINTS}
          selected={selectedFocals}
          onToggle={(val) => toggle(selectedFocals, setSelectedFocals, val)}
        />
      </div>

      {/* AI Guest Experience Summary */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">AI Guest Experience Preview</h3>
            <p className="text-xs text-slate-500">Auto-generated from your design selections</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            {currentAesthetic.name}
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed italic">"{summary}"</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from(selectedTextures)
            .slice(0, 3)
            .concat(Array.from(selectedFocals).slice(0, 2))
            .map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-700/50 text-slate-400 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

function Layers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ChecklistGroup({
  title,
  icon,
  items,
  selected,
  onToggle,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
}) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <span className="ml-auto text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
          {selected.size}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const active = selected.has(item);
          return (
            <li key={item}>
              <button
                onClick={() => onToggle(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all duration-150 ${
                  active
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                    : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border transition-all ${
                    active ? 'bg-amber-500 border-amber-500' : 'border-slate-600'
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5 text-slate-950" />}
                </span>
                {item}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Budget Tab ────────────────────────────────────────────────────────────────

function BudgetTab() {
  const [budget, setBudget] = useState<BudgetState>({
    acquisition: 45000,
    renovation: 28000,
    furniture: 18000,
    marketing: 5000,
    operatingMonthly: 3200,
  });
  const [occupancy, setOccupancy] = useState(68);
  const [nightlyRate, setNightlyRate] = useState(285);

  const metrics = useMemo(() => {
    const totalInvestment =
      budget.acquisition + budget.renovation + budget.furniture + budget.marketing;
    const monthlyRevenue = nightlyRate * 30 * (occupancy / 100);
    const annualRevenue = monthlyRevenue * 12;
    const monthlyNet = monthlyRevenue - budget.operatingMonthly;
    const breakEvenMonths = monthlyNet > 0 ? Math.ceil(totalInvestment / monthlyNet) : Infinity;
    const annualNet = annualRevenue - budget.operatingMonthly * 12;
    const annualROI = totalInvestment > 0 ? (annualNet / totalInvestment) * 100 : 0;
    return { totalInvestment, monthlyRevenue, annualRevenue, breakEvenMonths, annualNet, annualROI };
  }, [budget, occupancy, nightlyRate]);

  const updateBudget = (key: keyof BudgetState, val: number) =>
    setBudget((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 mb-1">Budget & ROI Calculator</h1>
        <p className="text-slate-400 text-sm">Model your financials and find your path to profitability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cost Inputs */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Startup Costs
            </h2>
            <div className="space-y-4">
              <CostInput
                label="Property Acquisition / Lease"
                value={budget.acquisition}
                onChange={(v) => updateBudget('acquisition', v)}
              />
              <CostInput
                label="Renovation & Construction"
                value={budget.renovation}
                onChange={(v) => updateBudget('renovation', v)}
              />
              <CostInput
                label="Furniture & Interior Design"
                value={budget.furniture}
                onChange={(v) => updateBudget('furniture', v)}
              />
              <CostInput
                label="Marketing & Launch Budget"
                value={budget.marketing}
                onChange={(v) => updateBudget('marketing', v)}
              />
            </div>
            <div className="mt-5 pt-5 border-t border-slate-700/40">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Investment</span>
                <span className="text-lg font-semibold text-amber-400">
                  ${metrics.totalInvestment.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Operating */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Monthly Operating Costs
            </h2>
            <CostInput
              label="Cleaning, Utilities, Platform Fees"
              value={budget.operatingMonthly}
              onChange={(v) => updateBudget('operatingMonthly', v)}
            />
          </div>
        </div>

        {/* Revenue + Output Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Revenue Sliders */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Revenue Projections
            </h2>
            <div className="space-y-7">
              <SliderInput
                label="Occupancy Rate"
                value={occupancy}
                min={10}
                max={100}
                step={1}
                unit="%"
                display={`${occupancy}%`}
                onChange={setOccupancy}
                color="emerald"
              />
              <SliderInput
                label="Nightly Rate"
                value={nightlyRate}
                min={50}
                max={1000}
                step={5}
                unit="$"
                display={`$${nightlyRate}`}
                onChange={setNightlyRate}
                color="amber"
              />
            </div>
          </div>

          {/* Output Metrics */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Financial Projections
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <MetricBox
                label="Monthly Revenue"
                value={`$${Math.round(metrics.monthlyRevenue).toLocaleString()}`}
                sub="at current occupancy"
                color="emerald"
              />
              <MetricBox
                label="Annual Gross Revenue"
                value={`$${Math.round(metrics.annualRevenue).toLocaleString()}`}
                sub="before operating costs"
                color="amber"
              />
              <MetricBox
                label="Annual Net Profit"
                value={`$${Math.round(metrics.annualNet).toLocaleString()}`}
                sub="after monthly operating"
                color="blue"
              />
              <MetricBox
                label="Estimated ROI"
                value={`${metrics.annualROI.toFixed(1)}%`}
                sub="annual return on investment"
                color="purple"
              />
            </div>

            {/* Break-Even */}
            <div
              className={`rounded-xl p-4 border flex items-center gap-4 ${
                metrics.breakEvenMonths <= 24
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : metrics.breakEvenMonths <= 36
                    ? 'bg-amber-500/10 border-amber-500/25'
                    : 'bg-red-500/10 border-red-500/25'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  metrics.breakEvenMonths <= 24
                    ? 'bg-emerald-500/20'
                    : metrics.breakEvenMonths <= 36
                      ? 'bg-amber-500/20'
                      : 'bg-red-500/20'
                }`}
              >
                <Clock
                  className={`w-5 h-5 ${
                    metrics.breakEvenMonths <= 24
                      ? 'text-emerald-400'
                      : metrics.breakEvenMonths <= 36
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Monthly Break-Even Point</p>
                <p className="text-xl font-bold text-slate-100">
                  {isFinite(metrics.breakEvenMonths)
                    ? `${metrics.breakEvenMonths} months`
                    : '— (revenue below costs)'}
                </p>
                {isFinite(metrics.breakEvenMonths) && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full investment recovered in ~{Math.ceil(metrics.breakEvenMonths / 12)} year
                    {Math.ceil(metrics.breakEvenMonths / 12) !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full bg-slate-700/40 border border-slate-600/50 rounded-xl pl-7 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
        />
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  display: string;
  onChange: (v: number) => void;
  color: 'amber' | 'emerald';
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColors: Record<string, string> = {
    amber: '#f59e0b',
    emerald: '#10b981',
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm text-slate-300">{label}</label>
        <span
          className={`text-lg font-bold ${color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}
        >
          {display}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${trackColors[color]} 0%, ${trackColors[color]} ${pct}%, rgb(51 65 85 / 0.6) ${pct}%, rgb(51 65 85 / 0.6) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1.5">
        <span>{min}{label.includes('Rate') && label.includes('Night') ? '$' : '%' }</span>
        <span>{max}{label.includes('Rate') && label.includes('Night') ? '$' : '%'}</span>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const borders: Record<string, string> = {
    emerald: 'border-emerald-500/20',
    amber: 'border-amber-500/20',
    blue: 'border-blue-500/20',
    purple: 'border-purple-500/20',
  };
  const texts: Record<string, string> = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };
  return (
    <div className={`bg-slate-800/50 border ${borders[color]} rounded-xl p-4`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${texts[color]}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Roadmap Tab ───────────────────────────────────────────────────────────────

function RoadmapTab({
  phases,
  onToggleItem,
}: {
  phases: RoadmapPhase[];
  onToggleItem: (phaseId: number, itemId: string) => void;
}) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  const togglePhase = (id: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalItems = phases.reduce((s, p) => s + p.items.length, 0);
  const completedItems = phases.reduce((s, p) => s + p.items.filter((i) => i.completed).length, 0);
  const overallPct = Math.round((completedItems / totalItems) * 100);

  const phaseColors: Record<number, string> = {
    1: 'amber',
    2: 'blue',
    3: 'purple',
    4: 'emerald',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 mb-1">Launch Roadmap</h1>
        <p className="text-slate-400 text-sm">
          Structured phases from concept to fully operational property.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Overall Launch Progress</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedItems} of {totalItems} tasks completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-400">{overallPct}%</span>
          </div>
        </div>
        <ProgressBar value={overallPct} color="amber" size="md" />

        <div className="grid grid-cols-4 gap-3 mt-5">
          {phases.map((phase) => {
            const phasePct = Math.round(
              (phase.items.filter((i) => i.completed).length / phase.items.length) * 100
            );
            return (
              <div key={phase.id} className="text-center">
                <ProgressBar value={phasePct} color={phaseColors[phase.id]} />
                <p className="text-xs text-slate-500 mt-1.5">Ph. {phase.id}</p>
                <p
                  className={`text-xs font-semibold ${
                    phaseColors[phase.id] === 'amber'
                      ? 'text-amber-400'
                      : phaseColors[phase.id] === 'blue'
                        ? 'text-blue-400'
                        : phaseColors[phase.id] === 'purple'
                          ? 'text-purple-400'
                          : 'text-emerald-400'
                  }`}
                >
                  {phasePct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const isExpanded = expandedPhases.has(phase.id);
          const phaseCompleted = phase.items.filter((i) => i.completed).length;
          const phasePct = Math.round((phaseCompleted / phase.items.length) * 100);
          const color = phaseColors[phase.id];
          const allDone = phasePct === 100;

          return (
            <div
              key={phase.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${phase.bgColor}`}
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
              >
                {/* Phase Number / Connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      allDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : phasePct > 0
                          ? `border-${color}-400 ${phase.accentColor}`
                          : 'border-slate-600 text-slate-500'
                    }`}
                  >
                    {allDone ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase tracking-wider ${phase.accentColor}`}>
                      Phase {phase.id}
                    </span>
                    {allDone && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Complete
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{phase.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{phase.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className={`text-sm font-bold ${phase.accentColor}`}>{phasePct}%</p>
                    <p className="text-xs text-slate-500">
                      {phaseCompleted}/{phase.items.length}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Phase Items */}
              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="ml-4 pl-4 border-l border-slate-700/50 space-y-2">
                    {phase.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onToggleItem(phase.id, item.id)}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${
                          item.completed
                            ? 'text-slate-500 bg-slate-700/20'
                            : 'text-slate-300 hover:bg-slate-700/30 hover:text-slate-200'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </span>
                        <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Visual */}
      <div className="mt-8 bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Estimated Timeline</h3>
        <div className="flex items-center gap-0">
          {['Weeks 1–4', 'Weeks 5–10', 'Weeks 11–14', 'Week 15+'].map((label, idx) => {
            const colors = ['bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
            const isLast = idx === 3;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${colors[idx]} ring-2 ring-offset-2 ring-offset-slate-950 ring-${['amber', 'blue', 'purple', 'emerald'][idx]}-500/40`} />
                  <p className="text-xs text-slate-400 mt-2 text-center">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 text-center font-medium">
                    {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'][idx]}
                  </p>
                </div>
                {!isLast && (
                  <div className="flex-1 h-px bg-slate-700 mx-1 mt-[-12px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Add Project Modal ─────────────────────────────────────────────────────────

function AddProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (project: Omit<Project, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    theme: 'biophilic',
    beds: 2,
    totalBudget: 60000,
    nightlyRate: 200,
  });

  const themeMap: Record<string, { display: string; emoji: string; roiMonths: number }> = {
    biophilic: { display: 'Modern Biophilic', emoji: '🌿', roiMonths: 18 },
    industrial: { display: 'Industrial Cozy', emoji: '🔩', roiMonths: 22 },
    nordic: { display: 'Nordic Minimalist', emoji: '❄️', roiMonths: 16 },
    japandi: { display: 'Japandi Zen', emoji: '🎋', roiMonths: 20 },
    coastal: { display: 'Coastal Luxe', emoji: '🌊', roiMonths: 17 },
    mountain: { display: 'Mountain Chalet', emoji: '🏔️', roiMonths: 21 },
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    const meta = themeMap[form.theme];
    onAdd({
      name: form.name,
      location: form.location,
      theme: meta.display,
      status: 'Planning',
      completion: 0,
      totalBudget: form.totalBudget,
      nightlyRate: form.nightlyRate,
      targetLaunch: '2026 Q2',
      beds: form.beds,
      roiMonths: meta.roiMonths,
      emoji: meta.emoji,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-100">New Property Concept</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Property Name</label>
            <input
              type="text"
              placeholder="e.g. The Cedar Haven"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Hudson Valley, NY"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Aesthetic Theme</label>
            <select
              value={form.theme}
              onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 transition-all"
            >
              {Object.entries(themeMap).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.emoji} {val.display}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Beds</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.beds}
                onChange={(e) => setForm((p) => ({ ...p, beds: Number(e.target.value) }))}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Budget ($)</label>
              <input
                type="number"
                step={5000}
                min={0}
                value={form.totalBudget}
                onChange={(e) => setForm((p) => ({ ...p, totalBudget: Number(e.target.value) }))}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Rate ($/night)</label>
              <input
                type="number"
                step={5}
                min={0}
                value={form.nightlyRate}
                onChange={(e) => setForm((p) => ({ ...p, nightlyRate: Number(e.target.value) }))}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-600/50 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: TabId; label: string; icon: ElementType; sub: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, sub: 'Portfolio overview' },
  { id: 'design', label: 'Design & Vibe', icon: Palette, sub: 'Concept board' },
  { id: 'budget', label: 'Budget & ROI', icon: Calculator, sub: 'Financial planning' },
  { id: 'roadmap', label: 'Launch Roadmap', icon: Map, sub: 'Phase checklist' },
];

function Sidebar({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (t: TabId) => void }) {
  return (
    <aside className="w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
            <Home className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 leading-none">SanctuaryCraft</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-none">Property Planner</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-amber-500/15 border border-amber-500/25'
                  : 'hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium leading-none ${
                    isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{item.sub}</p>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-amber-500/70 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">
            H
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-300 leading-none">Host Account</p>
            <p className="text-xs text-slate-600 mt-0.5 truncate">Pro Plan</p>
          </div>
          <Star className="w-3.5 h-3.5 text-amber-500/70 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function SanctuaryCraft() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [phases, setPhases] = useState<RoadmapPhase[]>(INITIAL_PHASES);

  const roadmapCompletion = useMemo(() => {
    const total = phases.reduce((s, p) => s + p.items.length, 0);
    const done = phases.reduce((s, p) => s + p.items.filter((i) => i.completed).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [phases]);

  const handleToggleItem = useCallback((phaseId: number, itemId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : phase
      )
    );
  }, []);

  const handleAddProject = useCallback((project: Omit<Project, 'id'>) => {
    setProjects((prev) => [...prev, { ...project, id: Date.now() }]);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto min-w-0">
        {activeTab === 'dashboard' && (
          <DashboardTab
            projects={projects}
            onAddProject={() => setShowAddModal(true)}
            roadmapCompletion={roadmapCompletion}
          />
        )}
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'roadmap' && (
          <RoadmapTab phases={phases} onToggleItem={handleToggleItem} />
        )}
      </main>

      {showAddModal && (
        <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={handleAddProject} />
      )}
    </div>
  );
}
