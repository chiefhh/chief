import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/join");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      profileViews: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      _count: {
        select: {
          profileViews: true,
          insights: true,
          connectionsReceived: true,
        },
      },
    },
  });

  if (!profile) redirect("/onboarding");

  // 按日期汇总浏览量（最近14天）
  const now = new Date();
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const viewsByDay = days14.map((day) => ({
    date: day,
    count: profile.profileViews.filter(
      (v) => v.createdAt.toISOString().split("T")[0] === day
    ).length,
  }));

  // 按国家汇总
  const byCountry = profile.profileViews.reduce(
    (acc, v) => {
      const country = v.country || "未知";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 按设备汇总
  const byDevice = profile.profileViews.reduce(
    (acc, v) => {
      const device = v.device || "未知";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const maxViewCount = Math.max(...viewsByDay.map((d) => d.count), 1);

  return (
    <main className="min-h-screen bg-chief-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-chief-slate hover:text-chief-dark transition-colors mb-6 block"
        >
          ← 返回控制台
        </Link>
        <h1 className="font-display text-3xl text-chief-dark mb-10">
          访客分析
        </h1>

        {/* 核心数据 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-chief-mist text-center">
            <div className="font-display text-4xl text-chief-dark">
              {profile._count.profileViews}
            </div>
            <div className="text-sm text-chief-slate mt-1">总浏览量</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-chief-mist text-center">
            <div className="font-display text-4xl text-chief-dark">
              {profile._count.insights}
            </div>
            <div className="text-sm text-chief-slate mt-1">洞察文章</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-chief-mist text-center">
            <div className="font-display text-4xl text-chief-dark">
              {profile.connectionCount}
            </div>
            <div className="text-sm text-chief-slate mt-1">连接数</div>
          </div>
        </div>

        {/* 14天浏览趋势 */}
        <div className="bg-white rounded-2xl p-6 border border-chief-mist mb-6">
          <h2 className="font-body text-sm font-medium text-chief-dark mb-4">
            主页浏览量 · 最近 14 天
          </h2>
          <div className="flex items-end gap-1 h-24">
            {viewsByDay.map((day) => {
              const height = Math.max((day.count / maxViewCount) * 100, 4);
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                  title={`${day.date}: ${day.count} 次`}
                >
                  <div
                    className="w-full bg-chief-gold/30 rounded-sm transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-chief-slate mt-2">
            <span>14天前</span>
            <span>今天</span>
          </div>
        </div>

        {/* 国家分布 */}
        {Object.keys(byCountry).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-chief-mist mb-6">
            <h2 className="font-body text-sm font-medium text-chief-dark mb-4">
              访客地区
            </h2>
            <div className="space-y-2">
              {Object.entries(byCountry)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([country, count]) => (
                  <div
                    key={country}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-chief-dark">{country}</span>
                    <span className="text-sm text-chief-slate">
                      {count} 次
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 设备分布 */}
        {Object.keys(byDevice).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-chief-mist mb-6">
            <h2 className="font-body text-sm font-medium text-chief-dark mb-4">
              访客设备
            </h2>
            <div className="space-y-2">
              {Object.entries(byDevice)
                .sort((a, b) => b[1] - a[1])
                .map(([device, count]) => (
                  <div
                    key={device}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-chief-dark">{device}</span>
                    <span className="text-sm text-chief-slate">
                      {count} 次
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {profile._count.profileViews === 0 && (
          <div className="text-center py-16 text-chief-slate font-body">
            <p>暂无访客数据</p>
            <p className="text-sm mt-2">
              分享你的门牌页后，数据将显示在这里
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
