"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Briefcase,
  Sparkles,
  BarChart3,
  Lock,
  CreditCard,
  ArrowRight,
  Check,
  Globe,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSession, signOut } from "next-auth/react";

/* ─── animation helpers ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const featureIcons = [Shield, Briefcase, Sparkles, BarChart3, Lock, CreditCard];

const memberData = [
  { name: "Sarah Chen",    title: "CTO",              company: "Luminex AI",     no: "No. 001", industry: "AI" },
  { name: "David Park",    title: "VP Engineering",   company: "Streamline",     no: "No. 002", industry: "SaaS" },
  { name: "Aisha Okafor",  title: "COO",              company: "NovaPay",        no: "No. 004", industry: "FinTech" },
  { name: "Thomas Becker", title: "CMO",              company: "Orbis Media",    no: "No. 005", industry: "Media" },
  { name: "Lin Xu",        title: "VP Product",       company: "Stellar Health", no: "No. 006", industry: "Health" },
  { name: "Elena Vasquez", title: "CHRO",             company: "TerraBank",      no: "No. 008", industry: "Finance" },
];

/* ─── Lang Toggle ────────────────────────────────── */
function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 font-body text-xs text-[#555555] hover:text-[#0A0A0A] transition-colors cursor-pointer select-none"
      aria-label="Switch language"
    >
      <span className={lang === "en" ? "text-[#B8944F] font-medium" : ""}>EN</span>
      <span className="opacity-30">/</span>
      <span className={lang === "zh" ? "text-[#B8944F] font-medium" : ""}>中文</span>
    </button>
  );
}

/* ─── Nav ────────────────────────────────────────── */
function Nav() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-16"
      style={{
        background: "rgba(254,252,247,0.82)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(184,148,79,0.12)",
      }}
    >
      <Link href="/">
        <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto" }} />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-[#555555] font-body">
        <Link href="/features" className="hover:text-[#0A0A0A] transition-colors">{t.nav.features}</Link>
        <Link href="/members" className="hover:text-[#0A0A0A] transition-colors">{t.nav.members}</Link>
        <Link href="/about"   className="hover:text-[#0A0A0A] transition-colors">{t.nav.about}</Link>
        <Link href="/faq"     className="hover:text-[#0A0A0A] transition-colors">{t.nav.faq}</Link>
      </div>

      <div className="flex items-center gap-4">
        <LangToggle />
        {status === "authenticated" && session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-1 ring-transparent group-hover:ring-[#B8944F]/50 transition-all" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#B8944F]/20 flex items-center justify-center font-body text-xs text-[#B8944F] font-medium">
                  {session.user.name?.[0] ?? "U"}
                </div>
              )}
              <span className="font-body text-xs text-[#0A0A0A] hidden md:block group-hover:text-[#B8944F] transition-colors">
                {session.user.name?.split(" ")[0]}
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="font-body text-xs text-[#555555] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/join">
            <Button size="sm">{t.nav.cta}</Button>
          </Link>
        )}

      </div>
    </motion.nav>
  );
}

/* ─── Hero ───────────────────────────────────────── */
function Hero() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y       = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]"
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(184,148,79,0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(184,148,79,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,148,79,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

      <motion.div style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-24 pb-16">

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="mb-8 inline-flex items-center gap-3">
          <span className="w-12 h-px" style={{ background: "linear-gradient(90deg, transparent, #B8944F)" }} />
          <span className="font-body text-[#B8944F] text-xs tracking-[0.25em] uppercase">{t.hero.eyebrow}</span>
          <span className="w-12 h-px" style={{ background: "linear-gradient(90deg, #B8944F, transparent)" }} />
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="font-display font-bold leading-[1.08] text-[#FEFCF7] mb-6"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}>
          {t.hero.headline1}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #E8D5A0 0%, #B8944F 50%, #E8D5A0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {t.hero.headline2}
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="font-body text-[#E8E2D8]/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          {t.hero.sub}
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href={session ? "/dashboard" : "/join"}>
            <Button size="lg" className="group">
              {session ? t.hero.ctaDashboard : t.hero.ctaPrimary}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/members">
            <Button size="lg" variant="outline"
              className="!border-[#B8944F]/40 !text-[#E8D5A0] hover:!bg-[#B8944F]/10">
              {t.hero.ctaSecondary}
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="mt-14 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-[#555555] text-sm font-body">
          {[
            { icon: Check, text: t.hero.trust1 },
            { icon: Users, text: t.hero.trust2 },
            { icon: Shield, text: t.hero.trust3 },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-[#B8944F]" />
              <span className="tracking-wide">{text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-[#B8944F]/60 to-transparent" />
      </motion.div>
    </section>
  );
}

/* ─── Product Demo ───────────────────────────────── */
function ProductDemo() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#FEFCF7] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-16 items-center">

          {/* Mock card */}
          <motion.div variants={fadeUp} className="relative">
            <div className="rounded-[18px] overflow-hidden"
              style={{ background: "#0A0A0A", boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B8944F] to-[#E8D5A0] flex items-center justify-center text-[#0A0A0A] font-display font-bold text-xl">SC</div>
                  <span className="text-[#B8944F] text-xs font-body tracking-widest">No. 001</span>
                </div>
                <h3 className="font-display text-[#FEFCF7] text-2xl font-bold mb-1">Sarah Chen</h3>
                <p className="font-body text-[#E8E2D8]/70 text-sm mb-3">CTO · Luminex AI</p>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[10px] font-body tracking-widest bg-[#B8944F]/15 text-[#B8944F] px-2.5 py-1 rounded-full">
                    {t.demo.tags.seriesC}
                  </span>
                  <span className="text-[10px] font-body tracking-widest bg-[#E8E2D8]/10 text-[#E8E2D8]/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> {t.demo.tags.verified}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap mb-6">
                  {["AI", "SaaS", "FinTech"].map((tag) => (
                    <span key={tag} className="text-[10px] font-body text-[#E8E2D8]/50 border border-[#E8E2D8]/10 px-2.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 pt-5 border-t border-[#E8E2D8]/10">
                  {[
                    { val: "3,420", label: t.demo.stats.views },
                    { val: "12",    label: t.demo.stats.insights },
                    { val: "84",    label: t.demo.stats.connections },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <div className="font-display text-[#FEFCF7] font-bold text-lg">{val}</div>
                      <div className="font-body text-[#555555] text-[10px] tracking-wide">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #B8944F 40%, #E8D5A0 60%, transparent)" }} />
            </div>
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute -top-5 -right-5 bg-[#FEFCF7] rounded-[14px] px-4 py-3 font-body text-xs"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>
              <div className="text-[#B8944F] font-medium">{t.demo.badge1}</div>
              <div className="text-[#555555]">{t.demo.badge2}</div>
            </motion.div>
          </motion.div>

          {/* Steps */}
          <motion.div variants={stagger} className="space-y-8">
            <motion.div variants={fadeUp}>
              <span className="font-body text-[#B8944F] text-xs tracking-[0.2em] uppercase">{t.demo.eyebrow}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A0A0A] mt-2 leading-tight">
                {t.demo.headline}
              </h2>
            </motion.div>
            {t.demo.steps.map(({ title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[#B8944F]/30 flex items-center justify-center font-body text-xs text-[#B8944F] tracking-widest group-hover:bg-[#B8944F] group-hover:text-[#FEFCF7] transition-all duration-300">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-body font-semibold text-[#0A0A0A] mb-1">{title}</h3>
                  <p className="font-body text-[#555555] text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────── */
function Features() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#F5F0E8] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.15 }} className="text-center mb-16">
          <motion.span variants={fadeUp} className="font-body text-[#B8944F] text-xs tracking-[0.2em] uppercase">
            {t.features.eyebrow}
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-[#0A0A0A] mt-3">
            {t.features.headline1}<br />{t.features.headline2}
          </motion.h2>
        </motion.div>

        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map(({ title, desc }, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div key={title} variants={fadeUp} whileHover={{ y: -4 }}
                className="bg-[#FEFCF7] rounded-[18px] p-7 transition-shadow duration-300 group cursor-default"
                style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-[10px] bg-[#B8944F]/10 flex items-center justify-center mb-5 group-hover:bg-[#B8944F]/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-[#B8944F]" />
                </div>
                <h3 className="font-body font-semibold text-[#0A0A0A] mb-2">{title}</h3>
                <p className="font-body text-[#555555] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────── */
function Stats() {
  const { t } = useLanguage();
  const icons = [Users, Shield, Check, Lock];
  return (
    <section className="bg-[#0A0A0A] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {t.stats.items.map(({ val, label }, i) => {
            const Icon = icons[i];
            return (
              <motion.div key={label} variants={fadeUp} className="flex flex-col items-center gap-2">
                <Icon className="w-4 h-4 text-[#B8944F] mb-2" />
                <div className="font-display text-3xl font-bold text-[#FEFCF7]">{val}</div>
                <div className="font-body text-[#555555] text-xs tracking-wide">{label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────── */
function Testimonials() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#0A0A0A] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.15 }} className="text-center mb-16">
          <motion.span variants={fadeUp} className="font-body text-[#B8944F] text-xs tracking-[0.2em] uppercase">
            {t.testimonials.eyebrow}
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-[#FEFCF7] mt-3">
            {t.testimonials.headline1}<br />{t.testimonials.headline2}
          </motion.h2>
        </motion.div>

        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.1 }} className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map(({ quote, name, title, company, no }) => (
            <motion.div key={name} variants={fadeUp} className="relative rounded-[18px] p-8"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.12)" }}>
              <div className="absolute top-6 right-6 font-body text-[10px] tracking-widest text-[#B8944F]">{no}</div>
              <p className="font-body text-[#E8E2D8]/80 text-sm leading-relaxed mb-7 italic">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-xs">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="font-body font-medium text-[#FEFCF7] text-sm">{name}</div>
                  <div className="font-body text-[#555555] text-xs">{title} · {company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Members Wall ───────────────────────────────── */
function MembersWall() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#FEFCF7] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.15 }} className="text-center mb-12">
          <motion.span variants={fadeUp} className="font-body text-[#B8944F] text-xs tracking-[0.2em] uppercase">
            {t.members.eyebrow}
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-[#0A0A0A] mt-3">
            {t.members.headline}
          </motion.h2>
          <motion.p variants={fadeUp} className="font-body text-[#555555] mt-4 text-base max-w-md mx-auto">
            {t.members.sub}
          </motion.p>
        </motion.div>

        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {memberData.map(({ name, title, company, no, industry }) => (
            <motion.div key={name} variants={fadeUp} whileHover={{ y: -3 }}
              className="bg-[#F5F0E8] rounded-[16px] p-5 cursor-pointer transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/30 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="font-body text-[9px] tracking-widest text-[#B8944F]">{no}</span>
              </div>
              <div className="font-body font-medium text-[#0A0A0A] text-sm">{name}</div>
              <div className="font-body text-[#555555] text-xs mt-0.5">{title}</div>
              <div className="font-body text-[#555555] text-xs">{company}</div>
              <div className="mt-3">
                <span className="font-body text-[9px] tracking-widest bg-[#B8944F]/10 text-[#B8944F] px-2 py-0.5 rounded-full">{industry}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link href="/members">
            <Button variant="outline" size="md">
              {t.members.viewAll} <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────── */
function FinalCTA() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  return (
    <section className="relative bg-[#F5F0E8] py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(184,148,79,0.06) 0%, transparent 70%)" }} />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div variants={stagger} whileInView="visible" initial="visible"
          viewport={{ once: true, amount: 0.3 }}>
          <motion.div variants={fadeUp} className="mx-auto mb-10 max-w-xs h-px"
            style={{ background: "linear-gradient(90deg, transparent, #B8944F 40%, #E8D5A0 60%, transparent)" }} />
          <motion.span variants={fadeUp} className="font-body text-[#B8944F] text-xs tracking-[0.2em] uppercase">
            {t.cta.eyebrow}
          </motion.span>
          <motion.h2 variants={fadeUp}
            className="font-display text-4xl md:text-[3.5rem] font-bold text-[#0A0A0A] mt-4 mb-5 leading-tight">
            {t.cta.headline1}<br />
            <span style={{
              background: "linear-gradient(135deg, #B8944F 0%, #9d7c3e 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {t.cta.headline2}
            </span>
          </motion.h2>
          <motion.p variants={fadeUp}
            className="font-body text-[#555555] text-base max-w-md mx-auto mb-10 leading-relaxed">
            {t.cta.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center">
            <Link href={session ? "/dashboard" : "/join"}>
              <Button size="lg" className="group">
                {session ? t.cta.buttonDashboard : t.cta.button}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="font-body text-[#555555]/60 text-xs mt-5 tracking-wide">
            {t.cta.fine}
          </motion.p>
          <motion.div variants={fadeUp} className="mx-auto mt-10 max-w-xs h-px"
            style={{ background: "linear-gradient(90deg, transparent, #B8944F 40%, #E8D5A0 60%, transparent)" }} />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────── */
function Footer() {
  const { t } = useLanguage();
  const linkGroups = [
    {
      heading: t.footer.platform,
      links: [
        { label: t.footer.links.features, href: "/features" },
        { label: t.footer.links.members,  href: "/members" },
        { label: t.footer.links.about,    href: "/about" },
      ],
    },
    {
      heading: t.footer.legal,
      links: [
        { label: t.footer.links.faq,     href: "/faq" },
        { label: t.footer.links.privacy, href: "/privacy" },
        { label: t.footer.links.terms,   href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0A0A0A] py-12 px-6 border-t border-[#B8944F]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div>
            <div className="mb-2">
              <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "52px", width: "auto", filter: "brightness(0) invert(1)" }} />
            </div>
            <p className="font-body text-[#555555] text-sm max-w-xs leading-relaxed">{t.footer.brand}</p>
            <div className="flex items-center gap-2 mt-4">
              <Shield className="w-3 h-3 text-[#B8944F]" />
              <span className="font-body text-[#555555] text-xs">{t.footer.privacy}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            {linkGroups.map(({ heading, links }) => (
              <div key={heading}>
                <div className="font-body text-[#FEFCF7] font-medium mb-3 text-xs tracking-widest uppercase">{heading}</div>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="font-body text-[#555555] hover:text-[#E8E2D8] transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E8E2D8]/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="font-body text-[#555555] text-xs">{t.footer.copy}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-body text-[#555555] text-xs">
              <Globe className="w-3 h-3 text-[#B8944F]" />
              {t.footer.ssl}
            </div>
            <span className="text-[#555555]">·</span>
            <div className="flex items-center gap-1.5 font-body text-[#555555] text-xs">
              <Shield className="w-3 h-3 text-[#B8944F]" />
              {t.footer.gdpr}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────── */
export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <ProductDemo />
      <Features />
      <Stats />
      <Testimonials />
      <MembersWall />
      <FinalCTA />
      <Footer />
    </main>
  );
}
