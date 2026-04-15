"use client";
import { useState } from "react";
import { Settings, FileText, Share2, X, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface OnboardingTourProps {
  slug: string;
  onClose: () => void;
}

const steps = {
  en: [
    {
      icon: <Settings className="w-8 h-8 text-[#B8944F]" />,
      title: "Complete Your Profile",
      desc: "Add your bio, industries, and social links to build trust.",
      action: "Go to Edit",
      href: "/edit",
    },
    {
      icon: <FileText className="w-8 h-8 text-[#B8944F]" />,
      title: "Publish Your First Insight",
      desc: "Share a perspective, lesson, or observation with the network.",
      action: "Write Now",
      href: "/insights/new",
    },
    {
      icon: <Share2 className="w-8 h-8 text-[#B8944F]" />,
      title: "Share Your Page",
      desc: "Your doorplate is live. Copy the link and share it anywhere.",
      action: null,
      href: null,
    },
  ],
  zh: [
    {
      icon: <Settings className="w-8 h-8 text-[#B8944F]" />,
      title: "完善资料",
      desc: "添加简介、行业和社交链接，建立专业信任感。",
      action: "去完善",
      href: "/edit",
    },
    {
      icon: <FileText className="w-8 h-8 text-[#B8944F]" />,
      title: "发布内容",
      desc: "向网络分享你的观点、经验或洞察。",
      action: "去发布",
      href: "/insights/new",
    },
    {
      icon: <Share2 className="w-8 h-8 text-[#B8944F]" />,
      title: "分享主页",
      desc: "你的数字门牌已上线，复制链接随时分享。",
      action: null,
      href: null,
    },
  ],
};

export function OnboardingTour({ slug, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { lang } = useLanguage();
  const t = steps[lang];
  const current = t[step];
  const isLast = step === 2;

  function handleAction() {
    if (current.href) {
      localStorage.setItem("chief_tour_seen", "1");
      router.push(current.href);
    }
  }

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://chief.me/${slug}`).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="relative w-full max-w-sm rounded-[24px] p-8"
        style={{ background: "#111111", border: "1px solid rgba(184,148,79,0.2)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555555] hover:text-[#E8E2D8] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? "24px" : "8px",
                background: i <= step ? "#B8944F" : "rgba(184,148,79,0.2)",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(184,148,79,0.1)" }}>
            {current.icon}
          </div>
          <h2 className="font-display text-xl font-bold text-[#FEFCF7] mb-2">{current.title}</h2>
          <p className="font-body text-sm text-[#555555]">{current.desc}</p>
        </div>

        {/* Step 3: show slug + copy */}
        {isLast && (
          <div
            className="rounded-[12px] px-4 py-3 mb-5 flex items-center justify-between"
            style={{ background: "rgba(184,148,79,0.06)", border: "1px solid rgba(184,148,79,0.15)" }}
          >
            <span className="font-body text-sm text-[#E8E2D8]/70">chief.me/{slug}</span>
            <button
              onClick={copyLink}
              className="font-body text-xs text-[#B8944F] hover:text-[#E8D5A0] transition-colors cursor-pointer"
            >
              {lang === "zh" ? "复制" : "Copy"}
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {current.href && (
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
            >
              {current.action} <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleNext}
            className="w-full font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors py-2 cursor-pointer"
          >
            {isLast
              ? (lang === "zh" ? "完成" : "Done")
              : (lang === "zh" ? "跳过此步" : "Skip")}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-center font-body text-[10px] text-[#555555] mt-4">
          {step + 1} / 3
        </p>
      </div>
    </div>
  );
}
