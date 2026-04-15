import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/join");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      insights: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) redirect("/onboarding");

  const published = profile.insights.filter((i) => !i.isDraft);
  const drafts = profile.insights.filter((i) => i.isDraft);

  return (
    <main className="min-h-screen bg-chief-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-chief-slate hover:text-chief-dark transition-colors mb-2 block"
            >
              ← 返回控制台
            </Link>
            <h1 className="font-display text-3xl text-chief-dark">我的洞察</h1>
          </div>
          <Link href="/insights/new">
            <button className="bg-chief-gold text-white px-6 py-2.5 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
              + 发布洞察
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 border border-chief-mist">
            <div className="font-display text-3xl text-chief-dark">
              {published.length}
            </div>
            <div className="text-sm text-chief-slate mt-1">已发布</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-chief-mist">
            <div className="font-display text-3xl text-chief-dark">
              {drafts.length}
            </div>
            <div className="text-sm text-chief-slate mt-1">草稿</div>
          </div>
        </div>

        {/* Published */}
        {published.length > 0 && (
          <section className="mb-10">
            <h2 className="font-body text-xs uppercase tracking-widest text-chief-slate mb-4">
              已发布
            </h2>
            <div className="space-y-3">
              {published.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl p-5 border border-chief-mist flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/insights/${insight.id}`}
                      className="font-body font-medium text-chief-dark hover:text-chief-gold transition-colors line-clamp-1 block"
                    >
                      {insight.title}
                    </Link>
                    {insight.summary && (
                      <p className="text-sm text-chief-slate mt-1 line-clamp-2">
                        {insight.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-chief-slate">
                        {new Date(insight.createdAt).toLocaleDateString(
                          "zh-CN"
                        )}
                      </span>
                      {insight.isPinned && (
                        <span className="text-xs text-chief-gold">📌 置顶</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/insights/${insight.id}`}
                    className="text-xs text-chief-slate hover:text-chief-gold transition-colors whitespace-nowrap"
                  >
                    编辑
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-body text-xs uppercase tracking-widest text-chief-slate mb-4">
              草稿
            </h2>
            <div className="space-y-3">
              {drafts.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl p-5 border border-chief-mist border-dashed flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/insights/${insight.id}`}
                      className="font-body font-medium text-chief-dark/60 hover:text-chief-dark transition-colors line-clamp-1 block"
                    >
                      {insight.title || "无标题草稿"}
                    </Link>
                    <div className="text-xs text-chief-slate mt-2">
                      {new Date(insight.updatedAt).toLocaleDateString("zh-CN")}{" "}
                      · 草稿
                    </div>
                  </div>
                  <Link
                    href={`/insights/${insight.id}`}
                    className="text-xs text-chief-slate hover:text-chief-gold transition-colors whitespace-nowrap"
                  >
                    继续编辑
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {profile.insights.length === 0 && (
          <div className="text-center py-20">
            <p className="text-chief-slate font-body mb-6">还没有洞察文章</p>
            <div className="flex gap-3 justify-center">
              <Link href="/insights/new">
                <button className="bg-chief-gold text-white px-6 py-2.5 rounded-full font-body text-sm font-medium cursor-pointer">
                  手动撰写
                </button>
              </Link>
              <Link href="/insights/shadow-writer">
                <button className="border border-chief-mist text-chief-dark px-6 py-2.5 rounded-full font-body text-sm font-medium hover:border-chief-gold/50 transition-colors cursor-pointer">
                  ✨ 影子写手
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
