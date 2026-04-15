"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Consulting","Manufacturing",
  "Media & Entertainment","Retail & E-commerce","Energy","Real Estate",
  "Education","Logistics","Telecommunications","Consumer Goods","Legal","Government",
];

interface Member {
  displayName: string;
  title: string;
  company: string;
  slug: string;
  industries: string[];
  globalNumber: number;
}

const copy = {
  en: {
    title: "Members",
    sub: "10,000 founding seats. VP+ verified.",
    join: "Join now",
    back: "Back to Dashboard",
    allIndustries: "All Industries",
    searchPh: "Search by title…",
    empty: "No members found.",
    loading: "Loading…",
  },
  zh: {
    title: "成员目录",
    sub: "10,000 个创始席位，VP+ 认证。",
    join: "立即加入",
    back: "返回控制台",
    allIndustries: "全部行业",
    searchPh: "搜索职位…",
    empty: "暂无成员。",
    loading: "加载中…",
  },
};

export default function MembersPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (industry) params.set("industry", industry);
    fetch(`/api/members?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .finally(() => setLoading(false));
  }, [industry]);

  const displayed = q
    ? members.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()))
    : members;

  return (
    <PageLayout title={t.title} backHref="/dashboard" backLabel={t.back}>
      <p className="text-[#B8944F] text-sm tracking-wide">{t.sub}</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 !mt-6">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="flex-1 rounded-[10px] px-3 py-2 font-body text-sm bg-[#F5F0E8] border border-[#E8D5A0]/40 text-[#0A0A0A] focus:outline-none focus:border-[#B8944F]"
        >
          <option value="">{t.allIndustries}</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPh}
          className="flex-1 rounded-[10px] px-3 py-2 font-body text-sm bg-[#F5F0E8] border border-[#E8D5A0]/40 text-[#0A0A0A] placeholder:text-[#999] focus:outline-none focus:border-[#B8944F]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <p className="font-body text-sm text-[#B8944F] !mt-8">{t.loading}</p>
      ) : displayed.length === 0 ? (
        <p className="font-body text-sm text-[#555555] !mt-8">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mt-6">
          {displayed.map((m) => (
            <Link
              key={m.slug}
              href={`/chief/${m.slug}`}
              className="rounded-[16px] p-5 bg-[#F5F0E8] hover:bg-[#EDE8E0] transition-colors block"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/30 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm">
                  {m.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="font-body text-[9px] tracking-widest text-[#B8944F]">
                  No. {String(m.globalNumber).padStart(3, "0")}
                </span>
              </div>
              <div className="font-body font-medium text-[#0A0A0A] text-sm">{m.displayName}</div>
              <div className="font-body text-[#555555] text-xs">{m.title} · {m.company}</div>
              {m.industries[0] && (
                <span className="mt-2 inline-block font-body text-[9px] tracking-widest bg-[#B8944F]/10 text-[#B8944F] px-2 py-0.5 rounded-full">
                  {m.industries[0]}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="!mt-10 text-center">
        <a href="/join" className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-8 py-3 text-sm transition-colors">
          {t.join}
        </a>
      </div>
    </PageLayout>
  );
}
