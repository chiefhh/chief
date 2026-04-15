"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Footer } from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function PageLayout({ children, title, backHref, backLabel }: PageLayoutProps) {
  const { lang, toggle } = useLanguage();
  const { data: session, status } = useSession();
  const resolvedBackHref = backHref ?? "/";
  const resolvedBackLabel = backLabel ?? (lang === "zh" ? "返回首页" : "Home");
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-16"
        style={{
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(184,148,79,0.12)",
        }}
      >
        <Link href="/">
          <Image
            src="/logo.png"
            alt="chief.me"
            height={358}
            width={623}
            style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="font-body text-xs text-[#555555] hover:text-[#E8E2D8] transition-colors"
          >
            <span className={lang === "en" ? "text-[#B8944F] font-medium" : ""}>EN</span>
            <span className="opacity-30 mx-1">/</span>
            <span className={lang === "zh" ? "text-[#B8944F] font-medium" : ""}>中文</span>
          </button>
          {status === "authenticated" && session?.user && (
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-1.5 font-body text-xs font-semibold text-[#B8944F] hover:text-[#D4AA6A] transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {lang === "zh" ? "控制台" : "Dashboard"}
            </Link>
          )}
          <Link
            href={resolvedBackHref}
            className="flex items-center gap-1.5 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {resolvedBackLabel}
          </Link>
        </div>
      </nav>
      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FEFCF7] mb-10 leading-tight">
          {title}
        </h1>
        <div className="font-body text-[#888888] leading-relaxed space-y-6 text-[15px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
