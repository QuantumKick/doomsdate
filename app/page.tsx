"use client";

import { useState, useEffect, useRef, Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wheat,
  Sandwich,
  Drumstick,
  Heart,
  Coffee,
  Utensils,
  Clock,
  Gamepad2,
  PlusCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Mic,
  Home,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import Sparkles from "@/components/Sparkles";
import FloatingOrbs from "@/components/FloatingOrbs";
import FairyFooter from "@/components/FairyFooter";

interface Answers {
  // --- Marvel "cover" quiz ---
  favoriteHero: string;
  favoriteTeam: string;
  doomsdayHype: number;
  // --- The real invitation ---
  isAvailable: boolean | null;
  date: Date | null;
  time: string;
  food: string[];
  movie: string;
  activity: string;
  excitement: number;
}

const HeartBackground = dynamic(() => import("@/components/HeartBackground"), {
  ssr: false,
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

// ---------------------------------------------------------------------------
// HERO ROSTER
// Each hero's picture lives in /public/minifigs/<slug>.<ext>, where the slug is
// the name in lowercase with dashes (e.g. "Captain America (Sam)" ->
// captain-america-sam.png). To use a different file or URL for one hero, add
// `image: "/minifigs/my-file.webp"` to that hero.
// ---------------------------------------------------------------------------
type Fig = {
  name: string;
  image?: string;
};

const HEROES: Fig[] = [
  // Avengers
  { name: "Thor" },
  { name: "Captain America (Sam)" },
  { name: "Steve Rogers" },
  { name: "Winter Soldier" },
  { name: "Black Panther" },
  { name: "Tony Stark" },
  { name: "Hulk" },
  { name: "Hawkeye" },
  { name: "Scarlet Witch" },
  { name: "Vision" },
  { name: "Doctor Strange" },
  { name: "Wong" },
  { name: "Ant-Man" },
  { name: "Wasp" },
  { name: "Captain Marvel" },
  { name: "Shang-Chi" },
  { name: "Spider-Man" },
  { name: "Loki" },
  // Fantastic Four
  { name: "Mr. Fantastic" },
  { name: "Invisible Woman" },
  { name: "Human Torch" },
  { name: "The Thing" },
  // X-Men
  { name: "Professor X" },
  { name: "Magneto" },
  { name: "Cyclops" },
  { name: "Beast" },
  { name: "Nightcrawler" },
  { name: "Mystique" },
  { name: "Wolverine" },
  { name: "Storm" },
  { name: "Gambit" },
  { name: "Deadpool" },
  // Guardians
  { name: "Star-Lord" },
  { name: "Rocket" },
  { name: "Groot" },
  { name: "Gamora" },
  { name: "Nebula" },
  { name: "Drax" },
  { name: "Mantis" },
  // Thunderbolts
  { name: "Yelena" },
  { name: "Red Guardian" },
  { name: "U.S. Agent" },
  { name: "Ghost" },
  { name: "Namor" },
  { name: "Sentry" },
  // Villains
  { name: "Doctor Doom" },
  { name: "Thanos" },
];

const TEAMS = [
  { name: "Avengers", tag: "Earth's Mightiest Heroes", color: "#5e031a", members: ["Thor", "Tony Stark", "Captain America (Sam)", "Hulk", "Captain Marvel"] },
  { name: "Fantastic Four", tag: "Marvel's First Family", color: "#3b82f6", members: ["Mr. Fantastic", "Invisible Woman", "Human Torch", "The Thing"] },
  { name: "X-Men", tag: "Mutants unite", color: "#facc15", members: ["Professor X", "Wolverine", "Storm", "Nightcrawler"] },
  { name: "Thunderbolts", tag: "Unlikely heroes", color: "#f87171", members: ["Yelena", "Red Guardian", "U.S. Agent", "Ghost"] },
  { name: "Guardians", tag: "Caught on a feeling", color: "#4ade80", members: ["Star-Lord", "Rocket", "Groot", "Gamora"] },
  { name: "Doom wins", tag: "Nobody survives", color: "#34d399", members: ["Doctor Doom"] },
];

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const initials = (name: string) =>
  name
    .split(/[\s().-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// .png, .jpg, .jpeg and .webp are tried in this order for each hero
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

// Shows the hero's picture, or their initials if no image file is found yet
function HeroFigure({ hero }: { hero: Fig }) {
  const [attempt, setAttempt] = useState(0);
  const src = hero.image
    ? attempt === 0
      ? hero.image
      : null
    : attempt < IMAGE_EXTENSIONS.length
    ? `/minifigs/${slugify(hero.name)}.${IMAGE_EXTENSIONS[attempt]}`
    : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={hero.name}
          draggable={false}
          onError={() => setAttempt((n) => n + 1)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="flex h-3/4 w-3/4 items-center justify-center rounded-full bg-zinc-700/70 text-xs sm:text-sm font-extrabold text-zinc-200">
          {initials(hero.name)}
        </span>
      )}
    </div>
  );
}

// A brick-shaped tile with studs on top that holds a minifigure
function BrickTile({
  selected,
  onClick,
  children,
  square = true,
  accent,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  square?: boolean;
  accent?: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={!selected && accent ? { borderColor: `${accent}80` } : undefined}
      className={`relative mt-2 flex w-full flex-col items-center rounded-lg border-2 border-b-4 px-2 pt-3 pb-2 transition-colors ${
        square ? "aspect-square" : ""
      } ${
        selected
          ? "border-yellow-300 bg-yellow-400/20 shadow-[0_0_18px_rgba(250,204,21,0.45)]"
          : "border-zinc-600 bg-zinc-800/80 hover:border-zinc-400"
      }`}
    >
      <span className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-2 w-4 rounded-t-sm border border-b-0 ${
              selected ? "border-yellow-300 bg-yellow-400/30" : "border-zinc-600 bg-zinc-800"
            }`}
          />
        ))}
      </span>
      {children}
    </motion.button>
  );
}

// Dark-glass choice button (replaces the white SelectButton)
function ChoiceButton({
  icon,
  label,
  isSelected,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-5 font-bold shadow-md transition-all duration-300 ${
        isSelected
          ? "border-emerald-300 bg-purple-600/30 text-white ring-4 ring-emerald-400/40"
          : "border-purple-400/30 bg-black/50 text-purple-100 hover:bg-purple-900/40 hover:border-purple-300/60"
      }`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

// Custom dark date picker (purple + green), replaces the shadcn Calendar
function DatePicker({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const canGoBack = view.getTime() > thisMonth;
  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const navBtn =
    "h-9 w-9 rounded-full border border-purple-400/40 text-purple-200 flex items-center justify-center transition hover:bg-purple-900/50 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="mx-auto w-full max-w-sm lg:max-w-xs mb-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className={navBtn}
          disabled={!canGoBack}
          onClick={() => setView(new Date(year, month - 1, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
          {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          className={navBtn}
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 text-xs font-semibold text-emerald-300/80">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const date = new Date(year, month, day);
          const past = date < today;
          const isSelected = !!selected && isSame(date, selected);
          const isToday = isSame(date, today);
          return (
            <button
              key={day}
              type="button"
              disabled={past}
              onClick={() => onSelect(date)}
              className={`aspect-square rounded-full text-sm transition ${
                isSelected
                  ? "bg-gradient-to-br from-purple-500 to-emerald-500 text-white font-bold shadow-[0_0_14px_rgba(168,85,247,0.6)]"
                  : past
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-zinc-100 hover:bg-purple-900/60"
              } ${isToday && !isSelected ? "ring-1 ring-emerald-400/70" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Avengers: Doomsday release: December 18, 2026 at 05:00 UTC
const DOOMSDAY_RELEASE = Date.UTC(2026, 11, 18, 5, 0, 0);

// Live countdown that sits in the background behind the card
function DoomsdayCountdown() {
  const [now, setNow] = useState<number | null>(null);

  // Offset between this device's clock and the server's clock (ms).
  // A wrong system clock or timezone on the device would otherwise shift the
  // hours, so we correct it using the server's time.
  const offsetRef = useRef(0);

  useEffect(() => {
    const tick = () => setNow(Date.now() + offsetRef.current);
    tick();
    const id = setInterval(tick, 250);

    const sent = Date.now();
    fetch("/api/time", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ now: serverNow }: { now: number }) => {
        const received = Date.now();
        // assume the request took the same time each way
        offsetRef.current = serverNow - (sent + received) / 2;
        tick();
      })
      .catch(() => {
        /* offline or no route: fall back to the device clock */
      });

    return () => clearInterval(id);
  }, []);

  if (now === null) return null; // avoids a server/client hydration mismatch

  const diff = Math.max(0, DOOMSDAY_RELEASE - now);

  // Whole calendar months first (in UTC), then the remainder as days/hours/min/sec
  const addMonthsUTC = (d: Date, m: number) => {
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth() + m;
    const lastDay = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    return new Date(
      Date.UTC(
        y,
        mo,
        Math.min(d.getUTCDate(), lastDay),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
      )
    );
  };
  const nowDate = new Date(Math.min(now, DOOMSDAY_RELEASE));
  const targetDate = new Date(DOOMSDAY_RELEASE);
  let months =
    (targetDate.getUTCFullYear() - nowDate.getUTCFullYear()) * 12 +
    (targetDate.getUTCMonth() - nowDate.getUTCMonth());
  if (addMonthsUTC(nowDate, months).getTime() > DOOMSDAY_RELEASE) months -= 1;
  months = Math.max(0, months);
  const rest = DOOMSDAY_RELEASE - addMonthsUTC(nowDate, months).getTime();

  const days = Math.floor(rest / 86_400_000);
  const hours = Math.floor((rest % 86_400_000) / 3_600_000);
  const minutes = Math.floor((rest % 3_600_000) / 60_000);
  const seconds = Math.floor((rest % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { label: "MONTHS", value: pad(months) },
    { label: "DAYS", value: pad(days) },
    { label: "HOURS", value: pad(hours) },
    { label: "MIN", value: pad(minutes) },
    { label: "SEC", value: pad(seconds) },
  ];

  return (
    <div className="pointer-events-none relative z-10 mb-4 lg:mb-3 text-center select-none shrink-0">
      <p className="text-[10px] sm:text-xs tracking-[0.5em] text-emerald-300/80 font-semibold mb-2">
        {diff > 0 ? "DOOMSDAY IS COMING" : "DOOMSDAY IS HERE"}
      </p>
      {diff > 0 && (
        <div className="flex items-start justify-center gap-2 sm:gap-6 text-emerald-200/70">
          {units.map(({ label, value }, i) => (
            <div key={label} className="flex items-start gap-2 sm:gap-6">
              <div>
                <div className="text-2xl sm:text-4xl lg:text-4xl font-extrabold tabular-nums drop-shadow-[0_0_14px_rgba(34,197,94,0.5)]">
                  {value}
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.3em] mt-1">{label}</div>
              </div>
              {i < units.length - 1 && (
                <span className="text-xl sm:text-4xl font-bold opacity-60">:</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnchantingDateProposalApp() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    favoriteHero: "",
    favoriteTeam: "",
    doomsdayHype: 50,
    isAvailable: null,
    date: null,
    time: "",
    food: [],
    movie: "",
    activity: "",
    excitement: 50,
  });

  const [hour, setHour] = useState<string>("7");
  const [minute, setMinute] = useState<string>("00");
  const [ampm, setAmpm] = useState<string>("PM");
  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showHeroInput, setShowHeroInput] = useState(false);
  const [customHero, setCustomHero] = useState("");
  const [heroCursor, setHeroCursor] = useState(0);
  const heroGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnswers((prev) => ({ ...prev, time: `${hour}:${minute} ${ampm}` }));
  }, [hour, minute, ampm]);

  const handleAnswer = (key: keyof Answers, value: Answers[keyof Answers]) => {
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    try {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return d.toDateString();
    }
  };

  const nextButtonClass =
    "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm";

  // ---------------------------------------------------------------------------
  // PRELUDE: Marvel / Avengers: Doomsday "survey" (the cover-up)
  // ---------------------------------------------------------------------------
  // --- Character-select screen logic (hero page) ---
  const heroTotal = HEROES.length + 1; // +1 for "Add your own"
  const customPicked =
    !!answers.favoriteHero && !HEROES.some((h) => h.name === answers.favoriteHero);

  const chooseHero = (i: number) => {
    setHeroCursor(i);
    if (i < HEROES.length) {
      setShowHeroInput(false);
      setAnswers((prev) => ({ ...prev, favoriteHero: HEROES[i].name }));
    } else {
      setCustomHero(customPicked ? answers.favoriteHero : "");
      setShowHeroInput(true);
    }
  };

  useEffect(() => {
    if (step !== 1) return; // only on the hero page
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const cols = heroGridRef.current
        ? getComputedStyle(heroGridRef.current).gridTemplateColumns.split(" ").length
        : 1;
      let next = heroCursor;
      if (e.key === "ArrowRight") next = Math.min(heroTotal - 1, heroCursor + 1);
      else if (e.key === "ArrowLeft") next = Math.max(0, heroCursor - 1);
      else if (e.key === "ArrowDown") next = Math.min(heroTotal - 1, heroCursor + cols);
      else if (e.key === "ArrowUp") next = Math.max(0, heroCursor - cols);
      else if (e.key === "Enter") {
        e.preventDefault();
        chooseHero(heroCursor);
        return;
      } else return;
      e.preventDefault();
      setHeroCursor(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, heroCursor, answers.favoriteHero]);

  const prelude = [
    // Intro
    <motion.div key="pre0" className="text-center" {...fadeInUp}>
      <h1 className="text-5xl sm:text-7xl font-extrabold mb-5 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
        Avengers: <span className="text-emerald-300">Doomsday</span> is coming
      </h1>
      <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-lg mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
        Before the multiverse collapses, I&apos;m conducting a very official,
        very serious Marvel survey. Please participate.
      </p>
      <Button onClick={() => setStep(step + 1)} className={nextButtonClass}>
        Fine, I&apos;ll take the survey
      </Button>
    </motion.div>,

    // Favorite hero: character-select screen
    <motion.div key="pre1" className="text-center" {...fadeInUp}>
      <h2 className="text-2xl sm:text-3xl font-playfair font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
        Who are you most excited to see in Doomsday?
      </h2>

      {/* name banner for whoever the cursor is on */}
      <div className="mx-auto mb-2 max-w-md -skew-x-12 border-y-2 border-emerald-300/70 bg-gradient-to-r from-purple-700/80 to-emerald-600/80 px-6 py-2 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
        <span className="block skew-x-12 text-lg sm:text-xl font-extrabold uppercase tracking-wide text-white">
          {heroCursor < HEROES.length
            ? HEROES[heroCursor].name
            : customPicked
            ? answers.favoriteHero
            : "Add your own"}
        </span>
      </div>
      <p className="text-xs text-emerald-200/60 mb-1">
        Hover or use the arrow keys to browse. Click or press Enter to pick.
      </p>

      {/* tilted grid of character cards */}
      <div style={{ perspective: "1000px" }} className="px-6 py-8">
        <div
          ref={heroGridRef}
          className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-1.5"
          style={{ transform: "rotateX(14deg)", transformStyle: "preserve-3d" }}
        >
          {HEROES.map((h, i) => {
            const active = heroCursor === i;
            const picked = answers.favoriteHero === h.name;
            return (
              <button
                key={h.name}
                type="button"
                aria-label={h.name}
                onMouseEnter={() => setHeroCursor(i)}
                onFocus={() => setHeroCursor(i)}
                onClick={() => chooseHero(i)}
                className={`relative aspect-[2/3] rounded-md border-2 bg-gradient-to-b from-zinc-600 to-zinc-900 transition-transform duration-150 ${
                  picked
                    ? "border-yellow-300"
                    : active
                    ? "border-white"
                    : "border-zinc-300/60"
                }`}
                style={{
                  transform: active ? "scale(1.9) translateZ(30px)" : "none",
                  zIndex: active ? 30 : picked ? 10 : 1,
                  boxShadow: active
                    ? "0 0 22px rgba(52,211,153,0.85)"
                    : picked
                    ? "0 0 14px rgba(250,204,21,0.7)"
                    : "none",
                }}
              >
                <span className="absolute inset-1">
                  <HeroFigure hero={h} />
                </span>
              </button>
            );
          })}

          {/* Add your own */}
          <button
            type="button"
            aria-label="Add your own"
            onMouseEnter={() => setHeroCursor(HEROES.length)}
            onFocus={() => setHeroCursor(HEROES.length)}
            onClick={() => chooseHero(HEROES.length)}
            className={`relative aspect-[2/3] rounded-md border-2 border-dashed bg-zinc-900 transition-transform duration-150 flex items-center justify-center ${
              customPicked
                ? "border-yellow-300"
                : heroCursor === HEROES.length
                ? "border-white"
                : "border-zinc-300/60"
            }`}
            style={{
              transform:
                heroCursor === HEROES.length ? "scale(1.9) translateZ(30px)" : "none",
              zIndex: heroCursor === HEROES.length ? 30 : 1,
              boxShadow:
                heroCursor === HEROES.length
                  ? "0 0 22px rgba(52,211,153,0.85)"
                  : "none",
            }}
          >
            <PlusCircle className="w-1/2 h-1/2 text-yellow-300" />
          </button>
        </div>
      </div>

      {showHeroInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto p-4 bg-black/60 rounded-lg shadow-md border border-purple-400/30 mb-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={customHero}
              placeholder="Who's your pick?"
              onChange={(e) => setCustomHero(e.target.value)}
              className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700 bg-purple-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customHero.trim()) {
                  setAnswers({ ...answers, favoriteHero: customHero.trim() });
                  setShowHeroInput(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (customHero.trim()) {
                  setAnswers({ ...answers, favoriteHero: customHero.trim() });
                  setShowHeroInput(false);
                }
              }}
              disabled={!customHero.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-full transition-all duration-300"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}

      <p className="text-sm text-emerald-100 mb-3 min-h-[1.25rem]">
        {answers.favoriteHero ? (
          <>
            Your pick: <span className="font-bold text-yellow-300">{answers.favoriteHero}</span>
          </>
        ) : (
          ""
        )}
      </p>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={!answers.favoriteHero}
        className={nextButtonClass}
      >
        Lock it in
      </Button>
    </motion.div>,

    // Team
    <motion.div key="pre3" className="text-center" {...fadeInUp}>
      <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
        Which team is surviving Doom?
      </h2>
      <p className="text-sm text-emerald-200/60 mb-5">Choose wisely.</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 pt-1">
        {TEAMS.map((team) => {
          const selected = answers.favoriteTeam === team.name;
          const members = team.members
            .map((n) => HEROES.find((h) => h.name === n))
            .filter((h): h is Fig => !!h);
          return (
            <BrickTile
              key={team.name}
              square={false}
              accent={team.color}
              selected={selected}
              onClick={() => setAnswers({ ...answers, favoriteTeam: team.name })}
            >
              <div className="flex h-16 sm:h-20 w-full items-end justify-center -space-x-2">
                {members.map((h) => (
                  <div key={h.name} className="relative h-full aspect-[60/88]">
                    <HeroFigure hero={h} />
                  </div>
                ))}
              </div>
              <span className="mt-2 text-sm sm:text-base font-extrabold text-zinc-100 leading-tight">
                {team.name}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold" style={{ color: team.color }}>
                {team.tag}
              </span>
            </BrickTile>
          );
        })}
      </div>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={!answers.favoriteTeam}
        className={nextButtonClass}
      >
        Next <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>,

    // Hype slider
    <motion.div key="pre4" className="text-center" {...fadeInUp}>
      <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-lime-300">
        How hyped are you for Doomsday?
      </h2>
      <div className="max-w-lg mx-auto mb-6 p-8 bg-black/40 rounded-2xl shadow-lg border border-emerald-500/30">
        <Slider
          defaultValue={[50]}
          max={100}
          step={25}
          onValueChange={(value) =>
            setAnswers({ ...answers, doomsdayHype: value[0] })
          }
        />
        <div className="flex justify-between mt-6 text-sm text-emerald-200 font-semibold">
          <span>Okay lang</span>
          <span>Cannot wait!</span>
        </div>
      </div>
      <p className="text-2xl font-playfair font-bold text-emerald-100 mb-8">
        Hype level: <span className="text-emerald-300">{answers.doomsdayHype}%</span>
      </p>
      <Button onClick={() => setStep(step + 1)} className={nextButtonClass}>
        Submit survey
      </Button>
    </motion.div>,

    // Transition into the real invitation
    <motion.div key="pre5" className="text-center" {...fadeInUp}>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-lime-300">
        Survey complete!
      </h2>
      <p className="text-lg text-emerald-100/80 mb-2">
        Great taste. {answers.favoriteHero ? `${answers.favoriteHero} is a solid pick.` : ""}
      </p>
      <p className="text-lg text-emerald-100/80 mb-8">
        ...but I have <span className="font-semibold">one more question</span>
      </p>
      <Button
        onClick={() => {
          setStep(step + 1);
        }}
        className={nextButtonClass}
      >
        What is it?
      </Button>
    </motion.div>,
  ];

  // ---------------------------------------------------------------------------
  // THE REAL INVITATION (unchanged)
  // ---------------------------------------------------------------------------
  const invitation = [
    
    <motion.div key="step0" className="text-center" {...fadeInUp}>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
        My dearest, Gabrielle
        <span className="block mt-4 text-2xl sm:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
              Come watch Avengers: Doomsday with me
        </span>
      </h1>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media1.tenor.com/m/8vXKZ8MRpZkAAAAd/marvel-cinematic-universe-victor-von-doom.gif"
        alt="Victor von Doom gif"
        className="w-full max-w-md mx-auto mb-4 rounded-lg shadow-lg lg:max-h-[26vh] lg:w-auto"
      />
      <div className="space-x-4">
        <Button
          onClick={() => {
            handleAnswer("isAvailable", true);
            triggerConfetti();
          }}
          className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
        >
          Ay tara
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-purple-400 text-purple-300 bg-transparent hover:bg-purple-900/40 hover:text-purple-200 font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              &apos;yoko nga
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-2 border-purple-400/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-300">
                Please
              </DialogTitle>
              <DialogDescription className="text-lg text-purple-100/80">
                please, please, please 
              </DialogDescription>
            </DialogHeader>
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://media1.tenor.com/m/S9e4TZwmalYAAAAC/jarvis-dr-doom.gif"
              alt="doom this guy gif"
              className="w-full max-w-md mx-auto mb-4 rounded-lg shadow-lg lg:max-h-[26vh] lg:w-auto"
            />{" "}
            <Button
              onClick={() => {
                handleAnswer("isAvailable", true);
                triggerConfetti();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Okay, fine...
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>,

    
    <motion.div key="step1" className="text-center" {...fadeInUp}>
      <div>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
        Yay! When ka available
      </h2>
      <div className="lg:flex lg:items-center lg:gap-6">
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media1.tenor.com/m/JARech4LpOIAAAAd/huh-iron-man.gif"
        alt="iron-kirk gif"
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-purple-400/30 lg:w-2/5 lg:mx-0"
      />
      <div className="mb-6 p-5 bg-black/50 rounded-2xl shadow-lg border border-purple-400/30 lg:flex-1">
        <DatePicker
          selected={answers.date}
          onSelect={(date) => setAnswers({ ...answers, date })}
        />
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Select onValueChange={(val) => setHour(val)}>
            <SelectTrigger className="w-28 sm:w-32 rounded-full bg-black/50 border-purple-400/40 text-purple-100">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-purple-400/40 text-purple-100">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <SelectItem key={h} value={`${h}`} className="focus:bg-purple-900/60 focus:text-white">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setMinute(val)}>
            <SelectTrigger className="w-28 sm:w-32 rounded-full bg-black/50 border-purple-400/40 text-purple-100">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-purple-400/40 text-purple-100">
              {['00', '15', '30', '45'].map((m) => (
                <SelectItem key={m} value={m} className="focus:bg-purple-900/60 focus:text-white">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setAmpm(val)}>
            <SelectTrigger className="w-44 rounded-full bg-black/50 border-purple-400/40 text-purple-100">
              <SelectValue placeholder="Umaga o Gabby" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-purple-400/40 text-purple-100">
              {['AM', 'PM'].map((ap) => (
                <SelectItem key={ap} value={ap} className="focus:bg-purple-900/60 focus:text-white">
                  {ap}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={!answers.date || !answers.time}
        className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
      >
        <Clock className="mr-2 h-5 w-5" /> Set the date!{" "}
        <Heart className="ml-2 h-5 w-5" />
      </Button>
      </div>
    </motion.div>,

  
    <motion.div key="step2" className="text-center" {...fadeInUp}>
      <div>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-purple-300">
        baka gusto nyo ako pakainin
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-3 mb-8 lg:mb-6">
        {[
          { name: "Coffee or Tea, Kapit bisig!", icon: <Coffee className="w-6 h-6" /> },
          { name: "Mcdo", icon: <Drumstick className="w-6 h-6" /> },
          { name: "jobili", icon: <Sandwich className="w-6 h-6" /> },
          { name: "mang inasal - walang kanin buseng", icon: <Wheat className="w-6 h-6" /> },
          { name: "''Kahit ano''", icon: <Utensils className="w-6 h-6" /> },
        ].map(({ name, icon }) => (
          <ChoiceButton
            key={name}
            icon={icon}
            label={name}
            isSelected={answers.food.includes(name)}
            onClick={() => {
              const newFood = answers.food.includes(name)
                ? answers.food.filter((f) => f !== name)
                : [...answers.food, name];
              setAnswers({ ...answers, food: newFood });
            }}
          />
        ))}
      </div>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={answers.food.length === 0}
        className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
      >
        Looks delicious! 🍽️
      </Button>
      </div>
    </motion.div>,

      
    <motion.div key="step3" className="text-center" {...fadeInUp}>
  <div>
    <h2 className="text-3xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-purple-300">
      Ano, tara?
    </h2>
  </div>

      {!showInput ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-3 mb-6">
          {[
            { name: "Bowling", icon: <Target className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Arcade", icon: <Gamepad2 className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Photobooth", icon: <Camera className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Karaoke", icon: <Mic className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Something else", icon: <PlusCircle className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Uwi na q", icon: <Home className="mx-auto mb-2 w-6 h-6" /> },
          ].map((activity) => (
            <motion.button
              key={activity.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black/50 text-purple-100 hover:bg-purple-900/40 font-bold py-4 px-6 rounded-lg shadow-md transition-colors duration-300 flex flex-col items-center justify-center border border-purple-400/30"
              onClick={() => {
                if (activity.name === "Something else") {
                  setShowInput(true);
                } else {
                  handleAnswer("activity", activity.name);
                }
              }}
            >
              {activity.icon}
              {activity.name}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto p-6 bg-black/60 rounded-lg shadow-md border border-purple-400/30 mb-6"
        >
          <label className="block text-purple-200 font-bold mb-3 text-lg">
            What do you have in mind? 💭
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700 bg-purple-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customInput.trim()) {
                  handleAnswer("activity", customInput);
                }
              }}
            />
            <button
              onClick={() => {
                if (customInput.trim()) {
                  handleAnswer("activity", customInput);
                }
              }}
              disabled={!customInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-full transition-all duration-300"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          <button 
            onClick={() => setShowInput(false)}
            className="text-xs text-purple-300/70 hover:text-purple-200 mt-4 underline block mx-auto"
          >
            Go back to options
          </button>
        </motion.div>
      )}
    </motion.div>,

    
    <motion.div key="step4" className="text-center" {...fadeInUp}>
      <div>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-purple-300">
        How excited are you for our date?
      </h2>
      <div className="max-w-lg mx-auto mb-8 p-8 bg-black/40 rounded-2xl shadow-lg border border-purple-400/30">
        <Slider
          defaultValue={[50]}
          max={100}
          step={25}
          onValueChange={(value) =>
            setAnswers({ ...answers, excitement: value[0] })
          }
        />
        <div className="flex justify-between mt-6 text-sm text-purple-200 font-semibold">
          <span>😐 Saks lang</span>
          <span>🤩 Super duper excited!</span>
        </div>
      </div>
      <motion.div
        className="text-4xl font-playfair font-bold text-zinc-100 mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        Excitement level: <span className="text-emerald-300">{answers.excitement}%</span>
      </motion.div>
      <Button
        onClick={() => {
          setStep(step + 1);
          setTimeout(triggerConfetti, 500);
        }}
        className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
      >
        Real eyes realize!
      </Button>
      </div>
    </motion.div>,

      
    <motion.div key="step5" className="text-center" {...fadeInUp}>
      <div>
      <h2 className="text-5xl sm:text-6xl font-playfair font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-purple-300">
        oki, see u gabeee!
      </h2>
      <p className="text-lg text-purple-200 mb-3 font-poppins">
        I can&apos;t wait to see you on:
      </p>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-block bg-black/40 px-6 py-4 rounded-2xl border border-purple-400/40 mb-8"
      >
        <p className="text-3xl font-playfair font-bold text-zinc-100">
          {formatDate(answers.date)} at {answers.time}
        </p>
      </motion.div>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media1.tenor.com/m/M0ARBQlZe10AAAAd/bee-minecraft.gif"
        alt="gabeee"
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-purple-400/30 lg:max-h-[24vh] lg:w-auto"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Heart className="text-emerald-400 w-16 h-16 lg:w-10 lg:h-10 mx-auto mt-6 lg:mt-2 animate-pulse" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-8 space-y-3 text-lg text-zinc-100 font-poppins"
      >
        <p className="text-base">We&apos;ll enjoy some delicious <span className="font-semibold">{answers.food.join(", ")}</span>.</p>
        {answers.activity === "Uwi na q" ? (
          <p className="text-base font-semibold italic text-emerald-300">Pagkatapos natin kumain, hatid agad kita pauwi safely!</p>
        ) : (
          <p className="text-base">Then we&apos;ll do <span className="font-semibold italic">&quot;{answers.activity}&quot;</span> together.</p>
        )}
        <p className="text-xl font-playfair font-bold mt-6">
          Your excitement level: <span className="text-emerald-300">{answers.excitement}/100</span>
        </p>
      </motion.div>
      </div>
    </motion.div>,
  ];

  // Marvel survey first, then the real invitation
  const steps = [...prelude, ...invitation];

  useEffect(() => {
    const saveAnswers = async () => {
      // FIX: Extract local Year, Month, Day digits to prevent ISO string UTC conversion!
      let dateString: string | null = null;
      if (answers.date) {
        const year = answers.date.getFullYear();
        const month = String(answers.date.getMonth() + 1).padStart(2, '0');
        const day = String(answers.date.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }

      const payload = {
        ...answers,
        date: dateString, // Pass pure "YYYY-MM-DD" string instead of Date object!
      };

      console.log('Saved answers:', payload);
      
      // Save to localStorage
      localStorage.setItem('dateProposalAnswers', JSON.stringify(payload));

      // Send to your email
      try {
        await fetch('/api/send-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Failed to send response:', error);
      }
    };

    if (step === steps.length - 1) {
      saveAnswers();
    }
  }, [step, answers, steps.length]);

  const isIntro = step === 0;

  return (
    <div
      className="relative min-h-screen lg:h-screen lg:overflow-hidden bg-black flex flex-col items-center justify-center p-4 sm:p-6"
      style={{
        // Put a dark, menacing Doom image at /public/doom-bg.jpg. Until then
        // you get the green-glow gradient underneath.
        backgroundImage:
          "radial-gradient(ellipse at 50% 20%, rgba(34,197,94,0.28), transparent 60%), url('/doom-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* darkening layer: light on the intro so the background shows, heavier after */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 transition-opacity duration-700"
        style={{ opacity: isIntro ? 0.2 : 1 }}
      />
      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isIntro ? 0.45 : 1,
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <DoomsdayCountdown />
      <Suspense fallback={null}>
        <HeartBackground />
      </Suspense>
      <div className="relative z-10 w-full max-w-3xl lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:max-h-[720px]">
        <FloatingOrbs />
        <div
          className={`relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-0 lg:flex-1 flex flex-col overflow-y-auto overflow-x-hidden rounded-3xl p-6 sm:p-10 lg:p-8 transition-all duration-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isIntro
              ? "border border-transparent bg-transparent"
              : "border border-emerald-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_60px_rgba(34,197,94,0.18)]"
          }`}
        >
          {!isIntro && <Sparkles count={18} />}
          <div className="my-auto">
            <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
          </div>
        </div>
        <FairyFooter />
      </div>
    </div>
  );
}