"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Send, Leaf, Globe, ShieldCheck, Facebook, Twitter, Youtube, Instagram, Linkedin } from "lucide-react";

/* ─── data ──────────────────────────────────────────────────── */
const productLinks = [
  { label: "Disease Lab",    href: "/disease-detection" },
  { label: "AI Assistant",   href: "/assistant" },
  { label: "How It Works",   href: "/#how-it-works" },
  { label: "Features",       href: "/#features" },
  { label: "Pricing",        href: "/#pricing" },
];

const resourceLinks = [
  { label: "Knowledge Hub",        href: "/assistant" },
  { label: "Guides & Articles",    href: "/assistant" },
  { label: "Crop Protection Tips", href: "/assistant" },
  { label: "FAQs",                 href: "/#faq" },
  { label: "Video Tutorials",      href: "/#tutorials" },
];

const companyLinks = [
  { label: "About Us",    href: "/#about" },
  { label: "Our Mission", href: "/#mission" },
  { label: "Careers",     href: "/#careers" },
  { label: "Blog",        href: "/#blog" },
  { label: "Contact Us",  href: "/#contact" },
];

const socialLinks = [
  { icon: Facebook,  href: "#", label: "Facebook" },
  { icon: Twitter,   href: "#", label: "Twitter" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
];

const footerStats = [
  { value: "12K+", label: "Farmers",   icon: Leaf },
  { value: "50+",  label: "Countries", icon: Globe },
  { value: "98%",  label: "Accuracy",  icon: ShieldCheck },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 group"
            >
              <span className="text-slate-600 group-hover:text-green-400 transition-colors text-base leading-none">›</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <footer className="relative mt-16">

      {/* ── full-bleed background image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/footer-bg.png"
          alt="Agricultural landscape"
          fill
          className="object-cover object-center"
        />
        {/* dark overlay so text is always readable — strong at top, lighter toward landscape */}
        <div className="absolute inset-0 bg-[#0b1510]/88" />
      </div>

      {/* ── SVG leaf decorations ── */}
      {/* <div className="pointer-events-none absolute left-0 bottom-16 z-10 w-28 opacity-25">
        <svg viewBox="0 0 110 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 180 C15 120 70 60 50 5 C95 50 125 130 60 180Z" fill="#4ade80"/>
          <line x1="35" y1="178" x2="50" y2="5" stroke="#86efac" strokeWidth="1.5"/>
        </svg
      </div>
      <div className="pointer-events-none absolute right-0 bottom-16 z-10 w-28 opacity-25 scale-x-[-1]">
        <svg viewBox="0 0 110 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 180 C15 120 70 60 50 5 C95 50 125 130 60 180Z" fill="#4ade80"/>
          <line x1="35" y1="178" x2="50" y2="5" stroke="#86efac" strokeWidth="1.5"/>
        </svg>
      </div> */}

      {/* ── content ── */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">

        {/* main grid — mt-16 gives clear breathing room from the section above */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-10 pt-14 pb-12 border-b border-white/10">

          {/* ── brand column ── */}
          <div className="sm:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  Agri<span className="text-green-400">Sense</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider uppercase">AI Crop Protection</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-6 sm:leading-7 max-w-[280px]">
              Empowering farmers with AI technology to detect diseases early, protect crops, and increase yields.
            </p>

            {/* stats */}
            <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-2.5">
              {footerStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-2">
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white">{stat.value}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── link columns ── */}
          <LinkColumn title="Product"   links={productLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Company"   links={companyLinks} />

          {/* ── newsletter + social ── */}
          <div className="sm:col-span-2 xl:col-span-1">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Stay Updated</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-6 sm:leading-7 mb-4 sm:mb-5">
              Subscribe to get the latest updates, farming tips, and product news.
            </p>

            {subscribed ? (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-green-400 font-medium">
                ✓ You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2 sm:space-y-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/6 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-400 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Subscribe
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </form>
            )}

            {/* social */}
            <div className="mt-5 sm:mt-6">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Follow Us</div>
              <div className="flex gap-2">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-400 transition-all duration-200"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── landscape reveal strip ─────────────────────────────
            The image shows through here at higher opacity so you
            clearly see the painted farm scene               ── */}
        <div className="relative -mx-4 sm:-mx-6 md:-mx-10 lg:-mx-16 xl:-mx-20 2xl:-mx-32 h-44 md:h-56 overflow-hidden">
          <Image
            src="/footer-bg.png"
            alt=""
            fill
            className="object-cover object-bottom"
            aria-hidden="true"
          />
          {/* fade from dark at top into the scene, then back to dark at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1510] via-transparent to-[#0b1510]/70" />
        </div>

        {/* ── bottom bar ── */}
        <div className="flex flex-col gap-3 border-t border-white/8 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 AgriSense. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-1">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-1">
                <Link href="#" className="hover:text-white transition-colors px-1">{item}</Link>
                {i < arr.length - 1 && <span className="text-slate-700">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
