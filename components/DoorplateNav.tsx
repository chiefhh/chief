"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function DoorplateNav() {
  const { lang } = useLanguage();
  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-4">
      <Link
        href="/members"
        className="flex items-center gap-1.5 font-body text-sm transition-colors"
        style={{ color: "rgba(184,148,79,0.5)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#B8944F")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(184,148,79,0.5)")}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {lang === "zh" ? "成员目录" : "Members"}
      </Link>
    </div>
  );
}

export function FoundingMemberBadge() {
  const { lang } = useLanguage();
  return <>{lang === "zh" ? "创始成员" : "Founding Member"}</>;
}

export function VPNetworkLabel() {
  const { lang } = useLanguage();
  return <>{lang === "zh" ? "VP+ 高管网络" : "VP+ Network"}</>;
}
