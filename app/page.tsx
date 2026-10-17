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
  Heart,
  Coffee,
  Utensils,
  Clock,
  Gamepad2,
  PlusCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sandwich,
  Soup,
  Cookie,
  Camera,
  Mic,
  ShoppingBag,
  Footprints,
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

// Draws a LEGO-style minifigure in SVG
function Minifig({ f = "#facc15", t, l, hg = "none", hc = "#111827", a, c }: Omit<Fig, "name" | "group">) {
  const covered = hg === "mask" || hg === "cowl";
  const headColor = covered ? hc : f;
  const studColor = hg === "hair" || hg === "helmet" ? hc : headColor;
  const eyeY = hg === "helmet" ? 22 : 18;
  return (
    <svg viewBox="0 0 60 88" className="h-full w-auto" aria-hidden="true">
      {c && <path d="M15 30 L45 30 L52 78 L8 78 Z" fill={c} opacity="0.9" />}
      {/* legs + feet */}
      <rect x="16" y="58" width="13" height="22" rx="2" fill={l} />
      <rect x="31" y="58" width="13" height="22" rx="2" fill={l} />
      <rect x="14" y="78" width="16" height="6" rx="2" fill="#000" opacity="0.35" />
      <rect x="30" y="78" width="16" height="6" rx="2" fill="#000" opacity="0.35" />
      {/* arms + hands */}
      <rect x="5" y="32" width="10" height="23" rx="3" fill={t} />
      <rect x="45" y="32" width="10" height="23" rx="3" fill={t} />
      <circle cx="10" cy="58" r="4.2" fill={f} />
      <circle cx="50" cy="58" r="4.2" fill={f} />
      {/* torso */}
      <rect x="14" y="30" width="32" height="30" rx="3" fill={t} />
      <rect x="14" y="30" width="32" height="30" rx="3" fill="none" stroke="#000" strokeOpacity="0.25" />
      {a && <circle cx="30" cy="44" r="5.5" fill={a} />}
      {/* neck + head stud + head */}
      <rect x="25" y="26" width="10" height="5" fill={f} />
      <rect x="25" y="3" width="10" height="7" rx="2" fill={studColor} />
      <rect x="19" y="9" width="22" height="19" rx="6" fill={headColor} />
      {hg === "hair" && (
        <path d="M18.5 17 V13 Q18.5 5 30 5 Q41.5 5 41.5 13 V17 Q41.5 11 30 11 Q18.5 11 18.5 17 Z" fill={hc} />
      )}
      {hg === "helmet" && (
        <path d="M18.5 19.5 V13 Q18.5 4 30 4 Q41.5 4 41.5 13 V19.5 Z" fill={hc} />
      )}
      {/* face */}
      {covered ? (
        <>
          <ellipse cx="25.5" cy="18" rx="3" ry="1.8" fill="#fff" />
          <ellipse cx="34.5" cy="18" rx="3" ry="1.8" fill="#fff" />
        </>
      ) : (
        <>
          <circle cx="25.5" cy={eyeY} r="1.6" fill="#111" />
          <circle cx="34.5" cy={eyeY} r="1.6" fill="#111" />
          <path d={`M26 ${eyeY + 5} Q30 ${eyeY + 8} 34 ${eyeY + 5}`} stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// A brick-shaped tile with studs on top that holds a minifigure
function BrickTile({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative mt-2 flex flex-col items-center rounded-lg border-2 border-b-4 px-2 pt-3 pb-2 transition-colors ${
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

// Edit these freely. Cast lists change, so tweak to whoever you think is in it.
// ---------------------------------------------------------------------------
// LEGO-style hero roster. Every minifigure is drawn in SVG from these colors,
// so no hero images are needed. Colors are stylized, not exact costumes.
//   f=face  t=torso  l=legs  hg=headgear  hc=headgear color  a=chest emblem  c=cape
// ---------------------------------------------------------------------------
type Fig = {
  name: string;
  group: string;
  f?: string;
  t: string;
  l: string;
  hg?: "hair" | "helmet" | "mask" | "cowl" | "none";
  hc?: string;
  a?: string;
  c?: string;
};

const HERO_GROUPS = ["All", "Avengers", "Fantastic Four", "X-Men", "Guardians", "Thunderbolts", "Villains"];

const HEROES: Fig[] = [
  // Avengers
  { name: "Thor", group: "Avengers", t: "#9ca3af", l: "#374151", hg: "hair", hc: "#facc15", c: "#dc2626", a: "#60a5fa" },
  { name: "Captain America", group: "Avengers", t: "#1e40af", l: "#1e3a8a", hg: "helmet", hc: "#1e40af", a: "#ffffff" },
  { name: "Winter Soldier", group: "Avengers", t: "#111827", l: "#111827", hg: "hair", hc: "#78350f", a: "#9ca3af" },
  { name: "Black Panther", group: "Avengers", t: "#111827", l: "#111827", hg: "mask", hc: "#111827", a: "#d1d5db" },
  { name: "Iron Man", group: "Avengers", t: "#b91c1c", l: "#b91c1c", hg: "mask", hc: "#b91c1c", a: "#facc15" },
  { name: "Hulk", group: "Avengers", f: "#4ade80", t: "#4ade80", l: "#7c3aed", hg: "hair", hc: "#1f2937" },
  { name: "Black Widow", group: "Avengers", t: "#111827", l: "#111827", hg: "hair", hc: "#dc2626", a: "#dc2626" },
  { name: "Hawkeye", group: "Avengers", t: "#6d28d9", l: "#1f2937", hg: "hair", hc: "#92400e", a: "#a78bfa" },
  { name: "Scarlet Witch", group: "Avengers", t: "#b91c1c", l: "#7f1d1d", hg: "hair", hc: "#7c2d12", a: "#facc15" },
  { name: "Vision", group: "Avengers", f: "#dc2626", t: "#16a34a", l: "#16a34a", c: "#facc15", a: "#facc15" },
  { name: "Doctor Strange", group: "Avengers", t: "#1d4ed8", l: "#1f2937", hg: "hair", hc: "#111827", c: "#dc2626", a: "#facc15" },
  { name: "Wong", group: "Avengers", t: "#7f1d1d", l: "#1f2937", hg: "hair", hc: "#111827", a: "#facc15" },
  { name: "Ant-Man", group: "Avengers", t: "#7f1d1d", l: "#7f1d1d", hg: "helmet", hc: "#7f1d1d", a: "#9ca3af" },
  { name: "Wasp", group: "Avengers", t: "#1f2937", l: "#1f2937", hg: "helmet", hc: "#facc15", a: "#facc15" },
  { name: "Captain Marvel", group: "Avengers", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#facc15", a: "#dc2626", c: "#dc2626" },
  { name: "Shang-Chi", group: "Avengers", t: "#7f1d1d", l: "#111827", hg: "hair", hc: "#111827", a: "#facc15" },
  { name: "Spider-Man", group: "Avengers", t: "#dc2626", l: "#1d4ed8", hg: "mask", hc: "#dc2626", a: "#111827" },
  { name: "Loki", group: "Avengers", t: "#166534", l: "#111827", hg: "hair", hc: "#111827", c: "#166534", a: "#facc15" },
  // Fantastic Four
  { name: "Mr. Fantastic", group: "Fantastic Four", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#9ca3af", a: "#ffffff" },
  { name: "Invisible Woman", group: "Fantastic Four", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#facc15", a: "#ffffff" },
  { name: "Human Torch", group: "Fantastic Four", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#78350f", a: "#f97316" },
  { name: "The Thing", group: "Fantastic Four", f: "#f97316", t: "#f97316", l: "#1d4ed8", a: "#1d4ed8" },
  // X-Men
  { name: "Professor X", group: "X-Men", t: "#1f2937", l: "#1f2937", a: "#facc15" },
  { name: "Magneto", group: "X-Men", t: "#7f1d1d", l: "#7f1d1d", hg: "helmet", hc: "#dc2626", c: "#7f1d1d", a: "#facc15" },
  { name: "Cyclops", group: "X-Men", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#78350f", a: "#facc15" },
  { name: "Beast", group: "X-Men", f: "#3b82f6", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#3b82f6", a: "#facc15" },
  { name: "Nightcrawler", group: "X-Men", f: "#1d4ed8", t: "#111827", l: "#111827", hg: "hair", hc: "#111827", a: "#dc2626" },
  { name: "Mystique", group: "X-Men", f: "#3b82f6", t: "#f5f5f4", l: "#f5f5f4", hg: "hair", hc: "#dc2626", a: "#facc15" },
  { name: "Wolverine", group: "X-Men", t: "#facc15", l: "#1d4ed8", hg: "hair", hc: "#78350f", a: "#1d4ed8" },
  { name: "Storm", group: "X-Men", t: "#f5f5f4", l: "#f5f5f4", hg: "hair", hc: "#e5e7eb", c: "#3b82f6", a: "#3b82f6" },
  { name: "Gambit", group: "X-Men", t: "#7e22ce", l: "#7e22ce", hg: "hair", hc: "#78350f", c: "#92400e", a: "#dc2626" },
  { name: "Deadpool", group: "X-Men", t: "#b91c1c", l: "#b91c1c", hg: "mask", hc: "#b91c1c", a: "#111827" },
  // Guardians
  { name: "Star-Lord", group: "Guardians", t: "#7f1d1d", l: "#374151", hg: "helmet", hc: "#9ca3af", a: "#facc15" },
  { name: "Rocket", group: "Guardians", f: "#b45309", t: "#f97316", l: "#f97316" },
  { name: "Groot", group: "Guardians", f: "#92400e", t: "#92400e", l: "#78350f", a: "#4ade80" },
  { name: "Gamora", group: "Guardians", f: "#4ade80", t: "#111827", l: "#111827", hg: "hair", hc: "#111827", a: "#4ade80" },
  { name: "Nebula", group: "Guardians", f: "#3b82f6", t: "#1f2937", l: "#1f2937", a: "#9ca3af" },
  { name: "Drax", group: "Guardians", f: "#94a3b8", t: "#7f1d1d", l: "#7f1d1d", a: "#dc2626" },
  { name: "Mantis", group: "Guardians", t: "#166534", l: "#166534", hg: "hair", hc: "#111827", a: "#4ade80" },
  // Thunderbolts
  { name: "Yelena", group: "Thunderbolts", t: "#111827", l: "#111827", hg: "hair", hc: "#facc15", a: "#dc2626" },
  { name: "Red Guardian", group: "Thunderbolts", t: "#b91c1c", l: "#b91c1c", hg: "hair", hc: "#78350f", a: "#facc15" },
  { name: "U.S. Agent", group: "Thunderbolts", t: "#1d4ed8", l: "#1d4ed8", hg: "hair", hc: "#facc15", a: "#dc2626" },
  { name: "Ghost", group: "Thunderbolts", t: "#f5f5f4", l: "#f5f5f4", hg: "mask", hc: "#f5f5f4", a: "#9ca3af" },
  { name: "Namor", group: "Thunderbolts", t: "#0ea5e9", l: "#0ea5e9", hg: "hair", hc: "#111827", a: "#facc15" },
  { name: "Sentry", group: "Thunderbolts", t: "#facc15", l: "#f5f5f4", hg: "hair", hc: "#fde047", c: "#facc15", a: "#dc2626" },
  // Villains
  { name: "Doctor Doom", group: "Villains", t: "#166534", l: "#374151", hg: "mask", hc: "#9ca3af", c: "#166534", a: "#9ca3af" },
  { name: "Thanos", group: "Villains", f: "#a855f7", t: "#1d4ed8", l: "#6b7280", hg: "helmet", hc: "#facc15", a: "#facc15" },
];

// Put the images in /public/teams/ (keep filenames in sync with these paths).
const TEAMS = [
  { name: "Avengers", image: "/teams/avengers.jpg" },
  { name: "Fantastic Four", image: "/teams/fantastic-four.jpg" },
  { name: "X-Men", image: "/teams/x-men.jpg" },
  { name: "Thunderbolts", image: "/teams/thunderbolts.jpg" },
];

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
    <div className="mx-auto w-full max-w-sm mb-4">
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
    <div className="pointer-events-none relative z-10 mb-6 text-center select-none">
      <p className="text-[10px] sm:text-xs tracking-[0.5em] text-emerald-300/80 font-semibold mb-2">
        {diff > 0 ? "DOOMSDAY IS COMING" : "DOOMSDAY IS HERE"}
      </p>
      {diff > 0 && (
        <div className="flex items-start justify-center gap-2 sm:gap-6 text-emerald-200/70">
          {units.map(({ label, value }, i) => (
            <div key={label} className="flex items-start gap-2 sm:gap-6">
              <div>
                <div className="text-2xl sm:text-5xl font-extrabold tabular-nums drop-shadow-[0_0_14px_rgba(34,197,94,0.5)]">
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
  const [heroGroup, setHeroGroup] = useState("All");
  const [heroQuery, setHeroQuery] = useState("");

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
  const filteredHeroes = HEROES.filter(
    (h) =>
      (heroGroup === "All" || h.group === heroGroup) &&
      h.name.toLowerCase().includes(heroQuery.trim().toLowerCase())
  );

  const prelude = [
    // Intro
    <motion.div key="pre0" className="text-center" {...fadeInUp}>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-400">
        Avengers: Doomsday is coming
      </h1>
      <p className="text-lg text-emerald-100/80 mb-8 max-w-md mx-auto">
        Before the multiverse collapses, I&apos;m conducting a very official,
        very serious survey.
      </p>
      <Button onClick={() => setStep(step + 1)} className={nextButtonClass}>
        Fine, I&apos;ll take the survey
      </Button>
    </motion.div>,

    // Favorite hero (LEGO-style roster)
    <motion.div key="pre1" className="text-center" {...fadeInUp}>
      <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-emerald-300">
        Who are you most excited to see in Doomsday?
      </h2>
      <p className="text-sm text-emerald-200/60 mb-4">
        Pick your fav, or enter your own.
      </p>

      {/* search + group tabs */}
      <input
        type="text"
        value={heroQuery}
        onChange={(e) => setHeroQuery(e.target.value)}
        placeholder="Search heroes..."
        className="w-full max-w-sm mx-auto mb-3 block px-4 py-2 border border-purple-400/40 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300 text-purple-100 bg-black/50 placeholder:text-purple-200/40"
      />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 sm:flex-wrap sm:justify-center">
        {HERO_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setHeroGroup(g)}
            className={`shrink-0 rounded-md border-b-4 px-3 py-1 text-xs font-bold transition ${
              heroGroup === g
                ? "bg-yellow-400 text-black border-yellow-600"
                : "bg-zinc-800 text-zinc-200 border-zinc-950 hover:bg-zinc-700"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* scrollable brick grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pt-3 pb-2 px-1 mb-4">
        {filteredHeroes.map((h) => (
          <BrickTile
            key={h.name}
            selected={answers.favoriteHero === h.name}
            onClick={() => {
              setShowHeroInput(false);
              setAnswers({ ...answers, favoriteHero: h.name });
            }}
          >
            <div className="h-20">
              <Minifig f={h.f} t={h.t} l={h.l} hg={h.hg} hc={h.hc} a={h.a} c={h.c} />
            </div>
            <span className="mt-1 text-[11px] sm:text-xs font-bold text-zinc-100 leading-tight text-center">
              {h.name}
            </span>
          </BrickTile>
        ))}

        {/* Add your own */}
        {(() => {
          const isCustom =
            !!answers.favoriteHero &&
            !HEROES.some((h) => h.name === answers.favoriteHero);
          return (
            <BrickTile
              selected={isCustom}
              onClick={() => {
                setCustomHero(isCustom ? answers.favoriteHero : "");
                setShowHeroInput(true);
              }}
            >
              <div className="h-20 flex items-center justify-center">
                <PlusCircle className="w-10 h-10 text-yellow-300" />
              </div>
              <span className="mt-1 text-[11px] sm:text-xs font-bold text-zinc-100 leading-tight text-center">
                {isCustom ? answers.favoriteHero : "Add your own"}
              </span>
            </BrickTile>
          );
        })()}
      </div>

      {filteredHeroes.length === 0 && (
        <p className="text-sm text-emerald-200/60 mb-4">
          No match. Use &quot;Add your own&quot; to type your pick.
        </p>
      )}

      {showHeroInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto p-4 bg-black/60 rounded-lg shadow-md border border-purple-400/30 mb-6"
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
      <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-400">
        Which team is surviving Doom?
      </h2>
      <p className="text-sm text-emerald-200/60 mb-6">Choose wisely.</p>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
        {TEAMS.map(({ name, image }) => {
          const selected = answers.favoriteTeam === name;
          return (
            <motion.button
              key={name}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAnswers({ ...answers, favoriteTeam: name })}
              className={`relative h-32 sm:h-40 rounded-xl overflow-hidden border-2 shadow-md transition-all duration-300 ${
                selected
                  ? "border-emerald-300 ring-4 ring-emerald-400/50"
                  : "border-emerald-500/40"
              }`}
              style={{
                backgroundColor: "#064e3b", // fallback if the image is missing
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {selected && (
                <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  ✓
                </span>
              )}
              <span className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm sm:text-base text-left drop-shadow">
                {name}
              </span>
            </motion.button>
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
              Would you go see Avengers: Doomsday with me?
        </span>
      </h1>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media1.tenor.com/m/nzwXJrBLS4gAAAAd/andrew-garfield.gif"
        alt="Andrew Garfield flower gif"
        className="w-full max-w-md mx-auto mb-4 rounded-lg shadow-lg"
      />
      <div className="space-x-4">
        <Button
          onClick={() => {
            handleAnswer("isAvailable", true);
            triggerConfetti();
          }}
          className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
        >
          Yes!!!
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
              src="https://media1.tenor.com/m/fRSVfm6M0ncAAAAd/gwen-amazing-spiderman.gif"
              alt="Gwen Stacy gif"
              className="w-full max-w-md mx-auto mb-4 rounded-lg shadow-lg"
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
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHlnMGQ5OTFpMWJ3dzA3ZGwwZzZmamlqZXoxbmc1MGN3MjllMjd5YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wgKDTcjWHrsLb8loKQ/giphy.gif"
        alt="spider-man running"
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-purple-400/30"
      />
      <div className="mb-6 p-5 bg-black/50 rounded-2xl shadow-lg border border-purple-400/30">
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
        Baka gusto mo&apos;ko pakainin
      </h2>
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        {[
          { name: "Coffee or Tea, Kapit bisig!", icon: <Coffee className="w-6 h-6" /> },
          { name: "Mcdo", icon: <Sandwich className="w-6 h-6" /> },
          { name: "Ramen", icon: <Soup className="w-6 h-6" /> },
          { name: "Samgyup", icon: <Utensils className="w-6 h-6" /> },
          { name: "Sweets & dessert", icon: <Cookie className="w-6 h-6" /> },
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
        <div className="grid grid-cols-2 gap-6 mb-6">
          {[
            { name: "Bowling", icon: <Target className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Arcade", icon: <Gamepad2 className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Window shopping", icon: <ShoppingBag className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Photobooth", icon: <Camera className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Karaoke", icon: <Mic className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Walk & chill", icon: <Footprints className="mx-auto mb-2 w-6 h-6" /> },
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
        How excited are you for our lakad?
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
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-purple-400/30"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Heart className="text-emerald-400 w-16 h-16 mx-auto mt-6 animate-pulse" />
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

  return (
    <div
      className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6"
      style={{
        // Put a dark, menacing Doom image at /public/doom-bg.jpg. Until then
        // you get the green-glow gradient underneath.
        backgroundImage:
          "radial-gradient(ellipse at 50% 20%, rgba(34,197,94,0.28), transparent 60%), linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.9)), url('/doom-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* dark vignette for the menacing look */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <DoomsdayCountdown />
      <Suspense fallback={null}>
        <HeartBackground />
      </Suspense>
      <div className="relative z-10 w-full max-w-3xl">
        <FloatingOrbs />
        <div className="relative w-full min-h-[560px] sm:min-h-[640px] flex flex-col justify-center overflow-hidden rounded-3xl border border-emerald-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_60px_rgba(34,197,94,0.18)] p-6 sm:p-10">
          <Sparkles count={18} />
          <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
        </div>
        <FairyFooter />
      </div>
    </div>
  );
}