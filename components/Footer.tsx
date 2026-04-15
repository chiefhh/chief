"use client";
import Link from "next/link";
import Image from "next/image";
import { Shield, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
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
