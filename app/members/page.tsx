"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const members = [
  { name: "Sarah Chen",    title: "CTO",            company: "Luminex AI",     no: "No. 001", industry: "AI" },
  { name: "David Park",    title: "VP Engineering", company: "Streamline",     no: "No. 002", industry: "SaaS" },
  { name: "Aisha Okafor",  title: "COO",            company: "NovaPay",        no: "No. 004", industry: "FinTech" },
  { name: "Thomas Becker", title: "CMO",            company: "Orbis Media",    no: "No. 005", industry: "Media" },
  { name: "Lin Xu",        title: "VP Product",     company: "Stellar Health", no: "No. 006", industry: "Health" },
  { name: "Elena Vasquez", title: "CHRO",           company: "TerraBank",      no: "No. 008", industry: "Finance" },
];

const copy = {
  en: { title: "Members", sub: "10,000 founding seats. VP+ verified.", join: "Join now", back: "Back to Dashboard" },
  zh: { title: "成员目录", sub: "10,000 个创始席位，VP+ 认证。", join: "立即加入", back: "返回控制台" },
};

export default function MembersPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  return (
    <PageLayout title={t.title} backHref="/dashboard" backLabel={t.back}>
      <p className="text-[#B8944F] text-sm tracking-wide">{t.sub}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mt-8">
        {members.map(({ name, title, company, no, industry }) => (
          <div key={name} className="rounded-[16px] p-5 bg-[#F5F0E8]">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/30 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm">
                {name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="font-body text-[9px] tracking-widest text-[#B8944F]">{no}</span>
            </div>
            <div className="font-body font-medium text-[#0A0A0A] text-sm">{name}</div>
            <div className="font-body text-[#555555] text-xs">{title} · {company}</div>
            <span className="mt-2 inline-block font-body text-[9px] tracking-widest bg-[#B8944F]/10 text-[#B8944F] px-2 py-0.5 rounded-full">{industry}</span>
          </div>
        ))}
      </div>
      <div className="!mt-10 text-center">
        <a href="/join" className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-8 py-3 text-sm transition-colors">
          {t.join}
        </a>
      </div>
    </PageLayout>
  );
}
