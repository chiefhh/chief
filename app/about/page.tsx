"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: {
    title: "About Chief.me",
    sections: [
      { h: "Why we built this", p: "VP-level and above executives have built something real — careers defined by hard decisions, teams shaped by judgment, and organizations transformed by leadership. Yet the tools available to present that work online are designed for everyone: résumé sites built for job seekers, social platforms optimized for engagement, personal websites that take months to build." },
      { h: "A different kind of platform", p: "Chief.me is not a social network. There is no feed, no likes, no follower count. It is a permanent address — a place where your professional identity is presented with the weight it deserves. Every member receives a sequential global number, a verified badge, and a structured space to document their decision-making, thinking, and impact." },
      { h: "Exclusive by design", p: "Chief.me is open to sign up for any VP-level or above executive. This is not gatekeeping for its own sake — it is the mechanism that keeps the community meaningful. When everyone has a chief.me page, no one does. We are building for the 10,000 leaders who shape the next decade, not the 100 million who want to look like them." },
      { h: "Free, forever", p: "Chief.me is and will remain free for all members. Our belief: the right platform for senior executives should not be a subscription tax on credibility. We will build a sustainable business through premium services for those who want them — never by charging for the core experience." },
      { h: "Contact", p: "For partnerships or press inquiries: hello@chief.me" },
    ],
  },
  zh: {
    title: "关于 Chief.me",
    sections: [
      { h: "我们为什么要做这个", p: "VP 及以上级别的高管已经建立了真实的成就——职业生涯由艰难决策定义，团队由判断力塑造，组织由领导力改变。然而，可用于在线展示这些成就的工具，是为所有人设计的：面向求职者的简历网站、以互动为目标的社交平台、需要数月才能搭建的个人网站。" },
      { h: "一种不同的平台", p: "Chief.me 不是社交网络。没有信息流，没有点赞，没有粉丝数。它是一个永久地址——你的职业身份在这里以应有的分量呈现。每位成员获得全球顺序编号、认证徽章，以及一个结构化的空间来记录决策、思考和影响力。" },
      { h: "设计上的专属性", p: "Chief.me 向所有 VP 及以上级别高管开放注册。这不是为了设门槛而设门槛——它是保持社区有意义的机制。当所有人都有 chief.me 页面时，就没有人真正拥有它了。我们为塑造下一个十年的 10,000 位领导者而建，而不是为想要看起来像他们的 1 亿人。" },
      { h: "永久免费", p: "Chief.me 现在是、将来也会是对所有成员免费。我们的信念：适合高管的平台，不应该是对信誉收取订阅税。我们将通过为有需要的用户提供增值服务来建立可持续的商业模式——绝不以核心体验收费。" },
      { h: "联系我们", p: "合作或媒体咨询：hello@chief.me" },
    ],
  },
};

export default function AboutPage() {
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
