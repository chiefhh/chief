"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: { title: "FAQ", items: [
    { q: "Who is Chief.me for?", a: "VP-level and above: VP, SVP, EVP, C-suite, Managing Directors, and Founders of growth-stage companies. We verify through invitation codes and community review." },
    { q: "How do I get an invitation code?", a: "Codes are distributed by existing members and by our team. Email hello@chief.me to apply directly. Current codes: CHIEF2026, FOUNDERS, EARLYBIRD." },
    { q: "Is it really free?", a: "Yes. Your chief.me page is free forever. We may offer optional premium features in the future, but the core experience will never cost anything." },
    { q: "What is a Decision Case?", a: "A structured narrative of a significant decision you made as a leader — the context, the conflict, your choice, and the outcome. It demonstrates judgment, not just experience." },
    { q: "Who can see my profile?", a: "Your profile is public at chief.me/yourslug. Contact details are private by default — visitors must request to connect. You can adjust privacy settings anytime." },
    { q: "How does the AI work?", a: "We use Claude by Anthropic for bio generation, decision case structuring, and the Shadow Writer feature. Your data is never used to train AI models." },
    { q: "Can I delete my account?", a: "Yes. Email hello@chief.me and we will permanently delete your account and all associated data within 30 days." },
  ]},
  zh: { title: "常见问题", items: [
    { q: "Chief.me 适合哪些人？", a: "VP 及以上级别：VP、SVP、EVP、C-suite、董事总经理，以及成长阶段公司的创始人。我们通过邀请码和社区审核进行验证。" },
    { q: "如何获得邀请码？", a: "邀请码由现有成员和我们团队发放。可直接发邮件至 hello@chief.me 申请。当前有效码：CHIEF2026、FOUNDERS、EARLYBIRD。" },
    { q: "真的永久免费吗？", a: "是的。你的 chief.me 页面永久免费。未来可能提供可选的高级功能，但核心体验永远不收费。" },
    { q: "什么是决策案例？", a: "你作为领导者做出的重大决策的结构化叙述——背景、冲突、你的选择和结果。它展示的是判断力，而不仅仅是经验。" },
    { q: "谁可以看到我的主页？", a: "你的主页在 chief.me/yourslug 公开可访问。联系方式默认私密——访客必须申请连接。你可以随时调整隐私设置。" },
    { q: "AI 功能如何工作？", a: "我们使用 Anthropic 的 Claude 进行简介生成、决策案例结构化和影子写手功能。你的数据绝不用于训练 AI 模型。" },
    { q: "可以删除账号吗？", a: "可以。发邮件至 hello@chief.me，我们将在 30 天内永久删除你的账号和所有相关数据。" },
  ]},
};

export default function FaqPage() {
  const { lang } = useLanguage();
  const t = content[lang];
  return (
    <PageLayout title={t.title}>
      {t.items.map(({ q, a }) => (
        <div key={q} className="border-b border-[#E8E2D8] pb-6">
          <h2 className="font-display text-lg font-bold text-[#0A0A0A] mb-2">{q}</h2>
          <p>{a}</p>
        </div>
      ))}
    </PageLayout>
  );
}
