"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: {
    title: "Features",
    sections: [
      { h: "Verified Executive Identity", p: "Every member receives a permanent sequential number (No. 001, 002…) and a VP+ verification badge. Enterprise scale is displayed alongside your title — Series C+, Fortune 500, Public — so your audience understands context, not just credentials." },
      { h: "Decision Cases", p: "Structured templates help you document the decisions that shaped your career: crisis management, strategic pivots, fundraising, talent strategy, and more. Unlike a résumé bullet, a Decision Case tells the full story — background, conflict, your call, and outcome." },
      { h: "AI Shadow Writer", p: "Paste a conference speech, LinkedIn post, or internal memo. Our AI extracts the insight, restructures it in your voice, and publishes it as a polished Insight article — your thinking, zero rewriting effort." },
      { h: "AI Bio Generator", p: "Three sentences that open with your mission, not your job title. Powered by Claude AI, tuned specifically for executive communication. Generate, refine, and publish in under two minutes." },
      { h: "Privacy-First Contact", p: "Your contact details are never public by default. Visitors must submit a connection request with context. You approve or decline. No cold messages, no unsolicited outreach." },
      { h: "Apple & Google Wallet Card", p: "Your doorplate in your pocket. Add a beautifully designed card to Apple Wallet or Google Wallet — visible on lock screen, shareable via NFC or QR code at conferences and meetings." },
      { h: "Real-Time Analytics", p: "See who's visiting your page, where they're coming from, what they're reading, and how your reach is growing over time. Private by default — your data stays yours." },
    ],
  },
  zh: {
    title: "功能特色",
    sections: [
      { h: "实名认证高管身份", p: "每位成员获得永久顺序编号（No. 001、002…）和 VP+ 认证徽章。企业规模（C 轮以上、世界500强、上市公司）与职位一并展示，让访客了解背景，而不只是头衔。" },
      { h: "决策案例沉淀", p: "结构化模板帮助你记录塑造职业生涯的关键决策：危机处理、战略转型、融资决策、人才策略等。与简历条目不同，决策案例讲述完整故事——背景、冲突、你的决定和最终结果。" },
      { h: "AI 影子写手", p: "粘贴一段演讲、LinkedIn 动态或内部备忘录，AI 提取核心洞见，以你的声音重新结构，发布为精致的洞察文章——你的思考，零改写成本。" },
      { h: "AI 简介生成器", p: "三句话，以你的使命开头，而不是职位名称。由 Claude AI 驱动，专为高管沟通调优。两分钟内生成、精修、发布。" },
      { h: "隐私优先联系", p: "你的联系方式默认从不公开。访客必须附带背景信息提交连接请求，由你审批或拒绝。没有冷消息，没有不请自来的打扰。" },
      { h: "Apple & Google Wallet 卡片", p: "将你的数字门牌放入口袋。添加精心设计的卡片到 Apple Wallet 或 Google Wallet——锁屏可见，支持在会议和活动中通过 NFC 或二维码分享。" },
      { h: "实时数据分析", p: "了解谁在访问你的页面、来源渠道、阅读内容，以及你的影响力如何随时间增长。默认私密——你的数据属于你。" },
    ],
  },
};

export default function FeaturesPage() {
  const { lang } = useLanguage();
  const t = content[lang];
  return (
    <PageLayout title={t.title}>
      {t.sections.map(({ h, p }) => (
        <div key={h}>
          <h2 className="font-display text-xl font-bold text-[#0A0A0A] mb-2">{h}</h2>
          <p>{p}</p>
        </div>
      ))}
    </PageLayout>
  );
}
