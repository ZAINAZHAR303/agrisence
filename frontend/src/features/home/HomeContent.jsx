"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Bot, Users, BookOpen, Camera as ScanIcon, Cpu, FileCheck, Star, ChevronRight } from "lucide-react";

/* ─── data ─────────────────────────────────────────────────── */

const features = [
  {
    title: "Disease Lab",
    body: "Upload a leaf photo and get instant AI diagnosis with treatment recommendations.",
    icon: Camera,
    img: "/disease-lab.png",
    href: "/disease-detection",
  },
  {
    title: "AI Assistant",
    body: "Ask any farming question and get expert answers in real-time.",
    icon: Bot,
    img: "/ai-chat.png",
    href: "/assistant",
  },
  {
    title: "Community",
    body: "Connect with fellow farmers, share experiences, and learn together.",
    icon: Users,
    img: "/community-card.png",
    href: "/social",
  },
  {
    title: "Knowledge Hub",
    body: "Access expert guides, articles, and best practices for crop protection.",
    icon: BookOpen,
    img: "/knowledge-hub.png",
    href: "/assistant",
  },
];

const stats = [
  { value: "94.2%", label: "Detection Accuracy" },
  { value: "2s", label: "Average Response" },
  { value: "12K+", label: "Active Farmers" },
  { value: "500+", label: "Expert Guides" },
];

const steps = [
  {
    number: "1",
    title: "Snap a Photo",
    body: "Take a clear photo of the affected leaf.",
    icon: ScanIcon,
  },
  {
    number: "2",
    title: "AI Analysis",
    body: "Our AI analyzes the image in under 3 seconds.",
    icon: Cpu,
  },
  {
    number: "3",
    title: "Get Results",
    body: "Receive diagnosis and treatment recommendations.",
    icon: FileCheck,
  },
];

const testimonials = [
  {
    quote: "AgriSense helped me identify the disease early. Saved my entire crop!",
    name: "Ramesh Yadav",
    role: "Wheat Farmer, India",
    initials: "RY",
  },
  {
    quote: "The AI suggestions are spot on and easy to follow. Highly recommended!",
    name: "Fatima Noor",
    role: "Vegetable Grower, Pakistan",
    initials: "FN",
  },
  {
    quote: "Finally, a platform that truly understands farmers' needs.",
    name: "Carlos M.",
    role: "Corn Farmer, Brazil",
    initials: "CM",
  },
];

/* ─── floating hero cards ──────────────────────────────────── */

function DiseaseCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, x: 16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="absolute top-8 right-4 z-10 w-52 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-md shadow-xl px-4 py-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <Image src="/disease-lab.png" alt="leaf" width={28} height={28} className="object-contain rounded-lg" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Disease Detected</div>
          <div className="text-sm font-bold text-slate-900 leading-tight">Bacterial Blight</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-1.5 rounded-full bg-green-500" style={{ width: "94%" }} />
        </div>
        <span className="text-xs font-semibold text-green-600">94.2%</span>
      </div>
    </motion.div>
  );
}

function TreatmentCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, x: 16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="absolute bottom-16 right-4 z-10 w-52 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-md shadow-xl px-4 py-3"
    >
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Recommended Treatment</div>
      <div className="flex items-center gap-2">
        <div className="text-2xl">🧪</div>
        <div className="text-sm font-bold text-slate-900">Copper-based Fungicide</div>
      </div>
    </motion.div>
  );
}

/* ─── main component ────────────────────────────────────────── */

export default function HomeContent() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* background image */}
        <Image
          src="/hero-bg.png"
          alt="Agricultural field at sunrise"
          fill
          priority
          className="object-cover object-center"
        />
        {/* dark overlay — heavier on left for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-green-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          AI-Powered Agriculture
        </motion.div>

        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* left — text */}
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[clamp(2rem,5.5vw,4.4rem)] font-extrabold leading-[1.1] tracking-tight text-white"
              >
                Smarter Detection.<br />
                Healthier Crops.<br />
                <span className="text-green-400">Better Tomorrow.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base leading-7 sm:leading-8 text-slate-300"
              >
                Detect crop diseases early, get expert recommendations, and connect with{" "}
                <span className="text-green-400 font-semibold">12,000+ farmers</span> worldwide.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3"
              >
                <Link
                  href="/disease-detection"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <ScanIcon className="h-4 w-4" />
                  Start Free Detection
                </Link>
                <Link
                  href="/disease-detection"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/18 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  🔬 Explore Disease Lab
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44 }}
                className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-5 text-xs sm:text-sm text-slate-300"
              >
                {["No Sign Up Required", "AI-Powered Accuracy", "100% Free Forever"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5">
                    <span className="text-green-400">✓</span>
                    {badge}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* right — farmer image + floating cards */}
            <div className="relative hidden lg:flex justify-center items-end h-[110vh] max-h-[700px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative h-[95%] w-full max-w-md"
              >
                <Image
                  src="/farmer-tablet.png"
                  alt="Farmer using AgriSense"
                  fill
                  className="object-contain object-bottom"
                />
              </motion.div>
              <DiseaseCard />
              <TreatmentCard />
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 sm:gap-3">
                <div className="text-green-400 text-base sm:text-xl font-bold">⚡</div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-xs sm:text-sm mb-3">
              🌿 Everything a <span className="text-green-500">farmer</span> needs
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Everything a <span className="text-green-500">farmer</span> needs
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
              Powerful AI tools to protect your crops and increase your yield
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-7 mb-4">{feat.body}</p>
                  
                  {/* Push actions to bottom for perfect horizontal alignment */}
                  <div className="mt-auto pt-2">
                    <Link
                      href={feat.href}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-500 transition-colors"
                    >
                      Explore <ChevronRight className="h-4 w-4" />
                    </Link>
                    {/* card illustration */}
                    <div className="mt-5 h-28 rounded-2xl overflow-hidden bg-green-50 relative">
                      <Image src={feat.img} alt={feat.title} fill className="object-contain p-2" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="bg-[#1a2e1e] py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto w-64 md:w-72"
            >
              {/* phone frame */}
              <div className="rounded-[2.8rem] border-4 border-slate-700 bg-white overflow-hidden shadow-2xl shadow-black/40">
                <Image
                  src="/phone-scan.png"
                  alt="AgriSense scan result screen"
                  width={320}
                  height={620}
                  className="w-full"
                />
              </div>
              {/* glow */}
              <div className="absolute -inset-6 rounded-[3rem] bg-green-500/10 blur-2xl -z-10" />
              {/* leaf decoration */}
              <motion.div
                animate={{ rotate: [0, 8, 0], y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-10 top-1/3 w-20 h-28 opacity-60"
              >
                <Image src="/leaf.png" alt="" fill className="object-contain" />
              </motion.div>
            </motion.div>

            {/* steps */}
            <div>
              <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">HOW IT WORKS</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-8 sm:mb-10">
                Detect diseases in<br />
                <span className="text-green-400">3 simple steps</span>
              </h2>

              <div className="space-y-6">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.12 }}
                      className="flex items-start gap-5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-extrabold text-lg shadow-lg shadow-green-500/30">
                        {step.number}
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">{step.title}</div>
                        <div className="mt-1 text-sm text-slate-400 leading-7">{step.body}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 sm:mt-10">
                <Link
                  href="/disease-detection"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 hover:bg-white/15 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Loved by <span className="text-green-500">farmers worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-8 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`h-2 rounded-full transition-all ${dot === 0 ? "w-6 bg-green-500" : "w-2 bg-slate-200"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <Image
          src="/community-bg.png"
          alt="Farmers in field"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/40" />

        <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Join the <span className="text-green-400">AgriSense</span> Community
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-7 sm:leading-8">
              Share, learn, and grow together with farmers worldwide.
            </p>
            <Link
              href="/social"
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Users className="h-4 w-4" />
              Join Community <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
