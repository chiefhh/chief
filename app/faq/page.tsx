"use client";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const content = {
  en: {
    title: "FAQ",
    sections: [
      {
        heading: "Membership & Verification",
        items: [
          {
            q: "Who is Chief.me for?",
            a: "VP-level and above: VP, SVP, EVP, C-suite, Managing Directors, and Founders of growth-stage companies. We focus on decision-makers who shape organizations.",
          },
          {
            q: "How do I join?",
            a: "Sign in with Google and fill out a short application — your name, title, company, and LinkedIn profile. Membership is open to qualifying executives and approved immediately upon submission.",
          },
          {
            q: "How does verification work?",
            a: "We verify seniority through your LinkedIn profile URL and public information. Profiles that don't meet the VP+ threshold may be reviewed and removed. We're building toward automated LinkedIn-level verification for greater trust.",
          },
          {
            q: "Is it really free?",
            a: "Yes. Your chief.me page is free forever. We may offer optional premium features in the future, but the core experience will never cost anything.",
          },
        ],
      },
      {
        heading: "Privacy & Data",
        items: [
          {
            q: "Who can see my profile?",
            a: "Your profile is public at chief.me/yourslug. Contact details are private by default — visitors must request to connect. You can adjust privacy settings anytime.",
          },
          {
            q: "What data do you store?",
            a: "We store your name, title, company, LinkedIn URL, and any profile content you create (bio, decision cases, insights). We do not sell your data or share it with third parties.",
          },
          {
            q: "How does the AI work?",
            a: "We use Claude by Anthropic for bio generation, decision case structuring, and the Shadow Writer feature. Your data is never used to train AI models.",
          },
          {
            q: "Can I delete my account?",
            a: "Yes. Email hello@chief.me and we will permanently delete your account and all associated data within 30 days.",
          },
        ],
      },
      {
        heading: "Platform & Roadmap",
        items: [
          {
            q: "What is a Decision Case?",
            a: "A structured narrative of a significant decision you made as a leader — the context, the conflict, your choice, and the outcome. It demonstrates judgment, not just experience.",
          },
          {
            q: "What's coming next?",
            a: "We're building: (1) verified LinkedIn sync, (2) peer endorsements, (3) private executive network matching, (4) digital business card export, (5) deeper AI writing assistance. Members shape the roadmap — email hello@chief.me with feedback.",
          },
          {
            q: "Can I suggest features?",
            a: "Absolutely. Email hello@chief.me or use the feedback link in your dashboard. Founding members have outsized influence on what we build.",
          },
        ],
      },
    ],
  },
  zh: {
    title: "常见问题",
    sections: [
      {
        heading: "会员资格与验证",
        items: [
          {
            q: "Chief.me 适合哪些人？",
            a: "VP 及以上级别：VP、SVP、EVP、C-suite、董事总经理，以及成长阶段公司的创始人。我们专注于塑造组织的决策者。",
          },
          {
            q: "如何加入？",
            a: "使用 Google 账号登录并填写简短申请表——姓名、职位、公司和 LinkedIn 主页。符合条件的高管可立即完成申请并获得会员资格。",
          },
          {
            q: "如何进行验证？",
            a: "我们通过您的 LinkedIn 主页 URL 和公开信息验证职位级别。不符合 VP+ 标准的主页可能会被审查和删除。我们正在构建自动化的 LinkedIn 级别验证以提升信任度。",
          },
          {
            q: "真的永久免费吗？",
            a: "是的。你的 chief.me 页面永久免费。未来可能提供可选的高级功能，但核心体验永远不收费。",
          },
        ],
      },
      {
        heading: "隐私与数据",
        items: [
          {
            q: "谁可以看到我的主页？",
            a: "你的主页在 chief.me/yourslug 公开可访问。联系方式默认私密——访客必须申请连接。你可以随时调整隐私设置。",
          },
          {
            q: "你们存储哪些数据？",
            a: "我们存储你的姓名、职位、公司、LinkedIn URL 以及你创建的所有主页内容（简介、决策案例、洞察）。我们不出售你的数据，也不与第三方共享。",
          },
          {
            q: "AI 功能如何工作？",
            a: "我们使用 Anthropic 的 Claude 进行简介生成、决策案例结构化和影子写手功能。你的数据绝不用于训练 AI 模型。",
          },
          {
            q: "可以删除账号吗？",
            a: "可以。发邮件至 hello@chief.me，我们将在 30 天内永久删除你的账号和所有相关数据。",
          },
        ],
      },
      {
        heading: "平台与路线图",
        items: [
          {
            q: "什么是决策案例？",
            a: "你作为领导者做出的重大决策的结构化叙述——背景、冲突、你的选择和结果。它展示的是判断力，而不仅仅是经验。",
          },
          {
            q: "接下来有什么新功能？",
            a: "我们正在构建：(1) LinkedIn 验证同步，(2) 同行背书，(3) 私密高管人脉匹配，(4) 数字名片导出，(5) 更深度的 AI 写作辅助。会员的意见直接影响我们的产品方向——发邮件至 hello@chief.me 分享你的反馈。",
          },
          {
            q: "可以建议功能吗？",
            a: "当然可以。发邮件至 hello@chief.me 或使用控制台中的反馈入口。创始成员对我们构建内容有重要影响力。",
          },
        ],
      },
    ],
  },
};

export default function FaqPage() {
  const { lang } = useLanguage();
  const t = content[lang];
  return (
    <PageLayout title={t.title}>
      {t.sections.map(({ heading, items }) => (
        <div key={heading} className="mb-10">
          <h2 className="font-body text-[10px] tracking-[0.2em] uppercase text-[#B8944F] mb-5">{heading}</h2>
          <div className="space-y-6">
            {items.map(({ q, a }) => (
              <div key={q} className="border-b border-[#E8E2D8]/30 pb-6">
                <h3 className="font-display text-lg font-bold text-[#0A0A0A] mb-2">{q}</h3>
                <p className="font-body text-sm text-[#555555] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageLayout>
  );
}
