"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: { title: "Terms of Service", updated: "Last updated: April 2026", sections: [
    { h: "Eligibility", p: "Chief.me is exclusively for VP-level and above executives. By creating a profile, you confirm that your professional title and company information are accurate. Misrepresentation may result in account removal." },
    { h: "Your content", p: "You own the content you post. By posting, you grant Chief.me a license to display it on your profile page. You are responsible for ensuring your content does not infringe third-party rights." },
    { h: "Acceptable use", p: "You may not use Chief.me for spam, impersonation, harassment, or any illegal purpose. Invitation codes are single-use and non-transferable for commercial gain." },
    { h: "Service availability", p: "We aim for high availability but do not guarantee uninterrupted service. We reserve the right to modify or discontinue features with reasonable notice." },
    { h: "Limitation of liability", p: "Chief.me is provided 'as is'. We are not liable for indirect, incidental, or consequential damages arising from your use of the platform." },
    { h: "Contact", p: "Legal questions: hello@chief.me" },
  ]},
  zh: { title: "服务条款", updated: "最后更新：2026 年 4 月", sections: [
    { h: "使用资格", p: "Chief.me 专为 VP 及以上级别的高管提供服务。创建主页即表示你确认职位和公司信息的真实性。虚假陈述可能导致账号被移除。" },
    { h: "你的内容", p: "你拥有所发布内容的所有权。发布内容即表示你授予 Chief.me 在你主页上展示该内容的许可。你有责任确保内容不侵犯第三方权利。" },
    { h: "可接受的使用", p: "你不得将 Chief.me 用于垃圾邮件、冒充他人、骚扰或任何非法目的。邀请码为一次性使用，不得用于商业转让。" },
    { h: "服务可用性", p: "我们致力于高可用性，但不保证服务不间断。我们保留在合理通知后修改或终止功能的权利。" },
    { h: "责任限制", p: "Chief.me 按「现状」提供。对于因使用本平台而产生的间接、附带或后果性损害，我们不承担责任。" },
    { h: "联系", p: "法律问题：hello@chief.me" },
  ]},
};

export default function TermsPage() {
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
