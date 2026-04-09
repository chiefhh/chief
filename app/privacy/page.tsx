"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: { title: "Privacy Policy", updated: "Last updated: April 2026", sections: [
    { h: "What we collect", p: "Name, email address, and profile picture from Google OAuth. Profile information you choose to add (bio, title, company, industry tags). Page view counts and referrer data (anonymized — we store country-level location only, never IP addresses)." },
    { h: "How we use it", p: "To operate your chief.me profile page. To send transactional emails (connection requests, account notices). To improve the platform through aggregated, anonymous analytics. We never sell, rent, or share your personal data with third parties." },
    { h: "AI features", p: "Text you submit to AI features (bio generator, Shadow Writer, Decision Case assistant) is processed by Anthropic's Claude API. This data is not stored by Anthropic for model training. We do not store your AI prompts after processing." },
    { h: "Data retention", p: "Your data is retained as long as your account is active. You may request deletion at any time by emailing hello@chief.me. We will permanently delete all data within 30 days." },
    { h: "Cookies", p: "We use session cookies for authentication only. We do not use tracking cookies or third-party advertising cookies." },
    { h: "Contact", p: "Privacy questions: hello@chief.me" },
  ]},
  zh: { title: "隐私政策", updated: "最后更新：2026 年 4 月", sections: [
    { h: "我们收集的信息", p: "通过 Google OAuth 获取的姓名、电子邮件地址和头像。你选择添加的个人资料信息（简介、职位、公司、行业标签）。页面浏览量和来源数据（匿名化——我们只存储国家级别的位置，从不存储 IP 地址）。" },
    { h: "使用方式", p: "运营你的 chief.me 主页。发送事务性邮件（连接请求、账户通知）。通过汇总的匿名分析改进平台。我们绝不出售、出租或与第三方共享你的个人数据。" },
    { h: "AI 功能", p: "你提交给 AI 功能（简介生成器、影子写手、决策案例助手）的文本由 Anthropic 的 Claude API 处理。该数据不会被 Anthropic 存储用于模型训练。我们在处理后不存储你的 AI 提示词。" },
    { h: "数据保留", p: "只要你的账户处于活跃状态，你的数据就会被保留。你可以随时通过发送邮件至 hello@chief.me 申请删除。我们将在 30 天内永久删除所有数据。" },
    { h: "Cookie", p: "我们仅使用用于身份验证的会话 Cookie。我们不使用跟踪 Cookie 或第三方广告 Cookie。" },
    { h: "联系", p: "隐私问题：hello@chief.me" },
  ]},
};

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const t = content[lang];
  return (
    <PageLayout title={t.title}>
      <p className="text-xs text-[#B8944F] tracking-widest uppercase">{t.updated}</p>
      {t.sections.map(({ h, p }) => (
        <div key={h}>
          <h2 className="font-display text-xl font-bold text-[#0A0A0A] mb-2">{h}</h2>
          <p>{p}</p>
        </div>
      ))}
    </PageLayout>
  );
}
