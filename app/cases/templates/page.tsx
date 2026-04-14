"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const templates = [
  {
    id: "PRODUCT_DECISION",
    caseTemplate: "PRODUCT_LAUNCH",
    emoji: "🎯",
    en: {
      title: "Product Decision",
      desc: "Document a make-or-break product call — launch, kill, or pivot.",
      questions: [
        "What product decision were you facing, and what was the market context?",
        "Who were the stakeholders and what were their conflicting positions?",
        "What data or signals pushed you toward your final choice?",
        "What did you decide and how did you communicate it?",
        "What was the measurable outcome 6–12 months later?",
      ],
    },
    zh: {
      title: "产品决策",
      desc: "记录一次关键的产品判断——发布、放弃或转向。",
      questions: [
        "你面临的产品决策是什么？当时的市场背景如何？",
        "谁是关键利益相关方？他们的立场有哪些冲突？",
        "哪些数据或信号推动了你的最终选择？",
        "你做出了什么决定，如何传达给团队？",
        "6-12 个月后，可量化的结果是什么？",
      ],
    },
  },
  {
    id: "ORG_RESTRUCTURING",
    caseTemplate: "ORG_RESTRUCTURING",
    emoji: "🏗️",
    en: {
      title: "Team Restructuring",
      desc: "Capture how you redesigned an org to unlock performance.",
      questions: [
        "What was the performance problem or strategic gap that triggered the change?",
        "What restructuring options did you consider?",
        "How did you manage the human side — retention, morale, communication?",
        "What was the new structure and why was it right for this moment?",
        "How did the team's output change in the 12 months after?",
      ],
    },
    zh: {
      title: "团队重组",
      desc: "记录你如何重新设计组织结构以释放绩效潜力。",
      questions: [
        "触发变革的绩效问题或战略缺口是什么？",
        "你考虑过哪些重组方案？",
        "你如何处理人的因素——留人、士气、沟通？",
        "新架构是什么，为何它适合当下时机？",
        "重组后 12 个月内，团队产出有哪些变化？",
      ],
    },
  },
  {
    id: "BUDGET_ALLOCATION",
    caseTemplate: "STRATEGIC_PIVOT",
    emoji: "💰",
    en: {
      title: "Budget Allocation",
      desc: "Show how you made hard resource trade-offs under constraint.",
      questions: [
        "What was the budget envelope and what were you trying to accomplish?",
        "What competing priorities were you balancing?",
        "What did you cut or defer, and how did you make that call?",
        "How did you align the organization around a potentially unpopular choice?",
        "What was the ROI or strategic impact of your allocation?",
      ],
    },
    zh: {
      title: "预算分配",
      desc: "展示你如何在资源约束下做出艰难的权衡取舍。",
      questions: [
        "预算规模是多少？你试图实现什么目标？",
        "你在平衡哪些相互竞争的优先级？",
        "你削减或推迟了什么，如何做出这个决定？",
        "你如何让组织接受可能不受欢迎的选择？",
        "你的分配带来了什么投资回报或战略影响？",
      ],
    },
  },
  {
    id: "CRISIS_MANAGEMENT",
    caseTemplate: "CRISIS_MANAGEMENT",
    emoji: "🚨",
    en: {
      title: "Crisis Management",
      desc: "Walk through a high-stakes moment and how you navigated it.",
      questions: [
        "What was the crisis — operational, reputational, or strategic?",
        "What was the immediate threat and who else was involved?",
        "What decisions did you make in the first 24–72 hours?",
        "How did you communicate internally and externally?",
        "What did you change after the crisis to prevent recurrence?",
      ],
    },
    zh: {
      title: "危机管理",
      desc: "复盘一次高风险时刻以及你的应对方式。",
      questions: [
        "危机是什么性质——运营、声誉还是战略危机？",
        "直接威胁是什么，还有哪些人卷入其中？",
        "最初 24-72 小时内你做出了哪些决策？",
        "你如何进行内部和外部沟通？",
        "危机之后，你做了哪些改变以防止复发？",
      ],
    },
  },
  {
    id: "TALENT_STRATEGY",
    caseTemplate: "TALENT_STRATEGY",
    emoji: "👥",
    en: {
      title: "Talent Strategy",
      desc: "Document a critical hire, fire, or build-vs-buy call.",
      questions: [
        "What was the talent gap or people challenge you were solving?",
        "What were the options — hire, promote, restructure, outsource?",
        "What criteria did you use to make the decision?",
        "How did you execute and what resistance did you face?",
        "How did the talent outcome affect business results?",
      ],
    },
    zh: {
      title: "人才策略",
      desc: "记录一次关键的招聘、离职或自建 vs 外包决策。",
      questions: [
        "你要解决的人才缺口或人员挑战是什么？",
        "有哪些选项——招聘、晋升、调整架构、外包？",
        "你用什么标准做出决定？",
        "你如何执行，遇到了哪些阻力？",
        "人才结果如何影响了业务成果？",
      ],
    },
  },
  {
    id: "TECHNOLOGY_BET",
    caseTemplate: "TECHNOLOGY_BET",
    emoji: "⚡",
    en: {
      title: "Technology Bet",
      desc: "Capture a major platform, architecture, or vendor decision.",
      questions: [
        "What technology decision were you facing and what was the scale/stakes?",
        "What alternatives did you evaluate and what were the trade-offs?",
        "How did you manage the risk — technical, organizational, financial?",
        "How did you build conviction and get buy-in from skeptics?",
        "How did the technology perform against your expectations?",
      ],
    },
    zh: {
      title: "技术押注",
      desc: "记录一次重大的平台、架构或供应商选型决策。",
      questions: [
        "你面临的技术决策是什么？规模和风险有多大？",
        "你评估了哪些替代方案，各有什么权衡？",
        "你如何管理风险——技术、组织、财务层面？",
        "你如何建立信念并赢得怀疑者的支持？",
        "技术表现是否符合你的预期？",
      ],
    },
  },
  {
    id: "MARKET_ENTRY",
    caseTemplate: "MARKET_ENTRY",
    emoji: "🌏",
    en: {
      title: "Market Entry",
      desc: "Tell the story of entering a new segment, region, or category.",
      questions: [
        "Why this market, and why now?",
        "What was the entry strategy — build, partner, acquire, or organic?",
        "What were the biggest unknowns and how did you de-risk them?",
        "What did you learn in the first 90 days that changed your approach?",
        "What did success look like and did you achieve it?",
      ],
    },
    zh: {
      title: "市场进入",
      desc: "讲述进入新细分市场、区域或品类的故事。",
      questions: [
        "为何进入这个市场？为何选择现在？",
        "进入策略是什么——自建、合作、收购还是自然增长？",
        "最大的未知量是什么？你如何降低风险？",
        "前 90 天你学到了什么，改变了哪些方法？",
        "成功的标准是什么？你实现了吗？",
      ],
    },
  },
  {
    id: "SCALING_CHALLENGE",
    caseTemplate: "SCALING_CHALLENGE",
    emoji: "📈",
    en: {
      title: "Scaling Challenge",
      desc: "Document how you scaled a team, product, or process through a growth inflection.",
      questions: [
        "What were you scaling and what broke or threatened to break?",
        "What was the constraint — people, systems, capital, or process?",
        "What structural or operational changes did you make?",
        "How did you keep culture and quality intact while moving fast?",
        "What metrics show the organization scaled successfully?",
      ],
    },
    zh: {
      title: "规模化挑战",
      desc: "记录你如何在增长拐点推动团队、产品或流程规模化。",
      questions: [
        "你在扩展什么？哪里出现了问题或威胁？",
        "瓶颈在哪里——人员、系统、资本还是流程？",
        "你做了哪些结构或运营层面的改变？",
        "在快速推进的同时，你如何保持文化和质量？",
        "哪些指标表明组织成功实现了规模化？",
      ],
    },
  },
];

export default function TemplatesPage() {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
          <Link href="/cases/new" className="flex items-center gap-1.5 font-body text-xs text-[#555555] hover:text-[#E8E2D8] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "zh" ? "返回" : "Back"}
          </Link>
        </div>

        {/* Title */}
        <div className="mb-10">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#B8944F] mb-2">
            {lang === "zh" ? "写作工具" : "Writing Tools"}
          </p>
          <h1 className="font-display text-3xl font-bold text-[#FEFCF7] mb-3">
            {lang === "zh" ? "写作模板库" : "Template Library"}
          </h1>
          <p className="font-body text-[#555555] text-sm max-w-xl">
            {lang === "zh"
              ? "选择一个决策场景，用引导式问题克服空白页恐惧，快速写出有深度的领导力叙事。"
              : "Choose a decision scenario and answer guided questions to write a compelling leadership narrative — no blank page anxiety."}
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid gap-4">
          {templates.map((tpl) => {
            const t = tpl[lang];
            return (
              <div
                key={tpl.id}
                className="rounded-[20px] p-6 group"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.12)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{tpl.emoji}</span>
                      <h2 className="font-display text-lg font-bold text-[#FEFCF7]">{t.title}</h2>
                    </div>
                    <p className="font-body text-[#555555] text-sm mb-4">{t.desc}</p>

                    <div className="space-y-2">
                      <p className="font-body text-[10px] tracking-widest uppercase text-[#B8944F]/70 mb-2">
                        {lang === "zh" ? "引导问题" : "Guiding Questions"}
                      </p>
                      {t.questions.map((q, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="font-body text-[10px] text-[#B8944F]/50 mt-0.5 flex-shrink-0 w-4">{i + 1}.</span>
                          <p className="font-body text-xs text-[#E8E2D8]/50 leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    href={`/cases/new?template=${tpl.caseTemplate}`}
                    className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-5 py-2.5 text-sm transition-colors"
                  >
                    {lang === "zh" ? "使用此模板" : "Use Template"} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
