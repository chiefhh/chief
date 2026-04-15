"use client";
import { useState } from "react";

type ContactPrivacy = "PUBLIC" | "APPLICATION" | "CHIEF_ONLY";

interface Props {
  profile: {
    id: string;
    openToOpps: boolean;
    contactPrivacy: ContactPrivacy;
    verified: boolean;
  };
}

export default function SettingsForm({ profile }: Props) {
  const [openToOpps, setOpenToOpps] = useState(profile.openToOpps);
  const [contactPrivacy, setContactPrivacy] = useState<ContactPrivacy>(
    profile.contactPrivacy
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openToOpps, contactPrivacy }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 隐私设置 */}
      <div className="bg-white rounded-2xl p-6 border border-chief-mist">
        <h2 className="font-body font-semibold text-chief-dark mb-1">
          联系方式隐私
        </h2>
        <p className="text-sm text-chief-slate mb-5">
          控制其他人如何与你取得联系
        </p>
        <div className="space-y-3">
          {[
            {
              value: "APPLICATION",
              label: "申请制（推荐）",
              desc: "访客需提交申请，由你审批",
            },
            {
              value: "PUBLIC",
              label: "公开",
              desc: "所有人可见你的联系方式",
            },
            {
              value: "CHIEF_ONLY",
              label: "仅 Chief 可见",
              desc: "联系方式完全私密",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-chief-cream transition-colors"
            >
              <input
                type="radio"
                name="contactPrivacy"
                value={opt.value}
                checked={contactPrivacy === opt.value}
                onChange={() =>
                  setContactPrivacy(opt.value as ContactPrivacy)
                }
                className="mt-0.5"
                style={{ accentColor: "#B8944F" }}
              />
              <div>
                <div className="text-sm font-medium text-chief-dark">
                  {opt.label}
                </div>
                <div className="text-xs text-chief-slate">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Open to Opportunities */}
      <div className="bg-white rounded-2xl p-6 border border-chief-mist">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-body font-semibold text-chief-dark">
              Open to Opportunities
            </h2>
            <p className="text-sm text-chief-slate mt-1">
              在你的门牌页显示"开放机会"徽章，吸引合适的合作邀约
            </p>
          </div>
          <button
            onClick={() => setOpenToOpps(!openToOpps)}
            className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors cursor-pointer"
            style={{ background: openToOpps ? "#B8944F" : "#E8E2D8" }}
            aria-label="Toggle open to opportunities"
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: openToOpps ? "translateX(28px)" : "translateX(4px)" }}
            />
          </button>
        </div>
      </div>

      {/* 危险区域 */}
      <div className="bg-white rounded-2xl p-6 border border-red-100">
        <h2 className="font-body font-semibold text-chief-dark mb-1">
          删除账号
        </h2>
        <p className="text-sm text-chief-slate mb-4">
          永久删除你的账号和所有数据。此操作不可撤销。
        </p>
        <a
          href="mailto:hello@chief.me?subject=账号删除申请"
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          发送删除申请 →
        </a>
      </div>

      {/* 保存 */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-chief-gold text-white py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {saving ? "保存中…" : saved ? "✓ 已保存" : "保存设置"}
      </button>
    </div>
  );
}
