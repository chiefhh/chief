import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/join");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      openToOpps: true,
      contactPrivacy: true,
      verified: true,
    },
  });

  if (!profile) redirect("/onboarding");

  return (
    <main className="min-h-screen bg-chief-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-chief-slate hover:text-chief-dark transition-colors mb-6 block"
        >
          ← 返回控制台
        </Link>
        <h1 className="font-display text-3xl text-chief-dark mb-10">设置</h1>
        <SettingsForm profile={profile} />
      </div>
    </main>
  );
}
