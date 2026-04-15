export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Media & Entertainment",
  "Retail & E-commerce",
  "Energy",
  "Real Estate",
  "Education",
  "Logistics",
  "Telecommunications",
  "Consumer Goods",
  "Legal",
  "Government",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const INDUSTRY_ZH: Record<Industry, string> = {
  Technology: "科技",
  Finance: "金融",
  Healthcare: "医疗健康",
  Consulting: "咨询",
  Manufacturing: "制造业",
  "Media & Entertainment": "媒体与娱乐",
  "Retail & E-commerce": "零售与电商",
  Energy: "能源",
  "Real Estate": "房地产",
  Education: "教育",
  Logistics: "物流",
  Telecommunications: "电信",
  "Consumer Goods": "消费品",
  Legal: "法律",
  Government: "政府",
};

export function industryLabel(ind: string, lang: "en" | "zh"): string {
  if (lang === "zh" && ind in INDUSTRY_ZH) {
    return INDUSTRY_ZH[ind as Industry];
  }
  return ind;
}
