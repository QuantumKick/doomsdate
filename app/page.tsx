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
import { Heart, Coffee, Utensils, Clock, Gamepad2, PlusCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
// Put the images in your Next.js /public/heroes/ folder (any .jpg/.png works,
// just keep the filenames below in sync). Portrait or square crops look best.
const HEROES = [
  { name: "Thor", image: "/heroes/thor.jpg" },
  { name: "Captain America (Sam)", image: "/heroes/captain-america.jpg" },
  { name: "Winter Soldier", image: "/heroes/winter-soldier.jpg" },
  { name: "Black Panther", image: "/heroes/black-panther.jpg" },
  { name: "Loki", image: "/heroes/loki.jpg" },
  { name: "Mr. Fantastic", image: "/heroes/mr-fantastic.jpg" },
  { name: "Professor X", image: "/heroes/professor-x.jpg" },
  { name: "Magneto", image: "/heroes/magneto.jpg" },
  { name: "Yelena", image: "/heroes/yelena.jpg" },
  { name: "Spider-Man (we can dream)", image: "/heroes/spider-man.jpg" },
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
  const prelude = [
    // Intro
    <motion.div key="pre0" className="text-center" {...fadeInUp}>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-400">
        Avengers: Doomsday is coming
      </h1>
      <p className="text-lg text-emerald-100/80 mb-8 max-w-md mx-auto">
        Before the multiverse collapses, I&apos;m conducting a very official,
        very serious Marvel survey. Please participate.
      </p>
      <Button onClick={() => setStep(step + 1)} className={nextButtonClass}>
        Fine, I&apos;ll take the survey
      </Button>
    </motion.div>,

    // Favorite hero
    <motion.div key="pre1" className="text-center" {...fadeInUp}>
      <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-400">
        Who are you most excited to see in Doomsday?
      </h2>
      <p className="text-sm text-emerald-200/60 mb-6">Pick your favorite, or add your own.</p>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        {HEROES.map(({ name, image }) => {
          const selected = answers.favoriteHero === name;
          return (
            <motion.button
              key={name}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setShowHeroInput(false);
                setAnswers({ ...answers, favoriteHero: name });
              }}
              className={`relative h-32 sm:h-40 rounded-xl overflow-hidden border-2 shadow-md transition-all duration-300 ${
                selected
                  ? "border-emerald-300 ring-4 ring-emerald-400/50"
                  : "border-emerald-500/40"
              }`}
              style={{
                backgroundColor: "#6b21a8", // fallback if the image is missing
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            >
              {/* dark gradient so the label stays readable */}
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

        {/* Add your own */}
        {(() => {
          const isCustom =
            !!answers.favoriteHero &&
            !HEROES.some((h) => h.name === answers.favoriteHero);
          return (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setCustomHero(isCustom ? answers.favoriteHero : "");
                setShowHeroInput(true);
              }}
              className={`relative h-32 sm:h-40 rounded-xl border-2 border-dashed shadow-md transition-all duration-300 flex flex-col items-center justify-center bg-black/50 ${
                isCustom
                  ? "border-emerald-300 ring-4 ring-emerald-400/50"
                  : "border-emerald-500/50"
              }`}
            >
              {isCustom ? (
                <>
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    ✓
                  </span>
                  <span className="text-emerald-100 font-bold text-base px-3">
                    {answers.favoriteHero}
                  </span>
                  <span className="text-xs text-emerald-300/60 mt-1">tap to change</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-8 h-8 text-emerald-300 mb-2" />
                  <span className="text-emerald-200 font-bold">Add your own</span>
                </>
              )}
            </motion.button>
          );
        })()}
      </div>

      {showHeroInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto p-4 bg-black/60 rounded-lg shadow-md border border-emerald-500/30 mb-6"
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
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-full transition-all duration-300"
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
        Whatchu wanna eat
      </h2>
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        {[
          { name: "Coffee or Tea, Kapit bisig!", icon: <Coffee className="w-6 h-6" /> },
          { name: "Mcdo w/ happy meal?", icon: <Utensils className="w-6 h-6" /> },
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
            { name: "Bowling",}, 
            { name: "Arcade", icon: <Gamepad2 className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Something else", icon: <PlusCircle className="mx-auto mb-2 w-6 h-6" /> },
            { name: "Uwi na q"},

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