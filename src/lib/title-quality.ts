import type { TitleQualityResult } from "@/lib/types";

const vagueWords = [
  "研究",
  "分析",
  "探讨",
  "影响",
  "问题",
  "相关",
  "some",
  "study",
  "analysis",
  "impact",
];

const relationTokens = [
  "对",
  "与",
  "影响",
  "机制",
  "作用",
  "relationship",
  "effect",
  "between",
  "on",
];

const scopeTokens = [
  "中国",
  "近岸",
  "区域",
  "城市",
  "案例",
  "202",
  "省",
  "市",
  "coastal",
  "urban",
  "regional",
  "case",
];

const methodTokens = [
  "实证",
  "回归",
  "模型",
  "实验",
  "综述",
  "比较",
  "问卷",
  "访谈",
  "simulation",
  "model",
  "review",
  "empirical",
];

function hasAnyToken(value: string, tokens: string[]) {
  return tokens.some((token) => value.includes(token));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function evaluateTitleQuality(title: string): TitleQualityResult {
  const raw = title.trim();
  if (!raw) {
    return {
      score: 0,
      level: "weak",
      tips: ["请先输入题目。"],
    };
  }

  const normalized = raw.toLowerCase();
  let score = 0;
  const tips: string[] = [];

  const length = raw.length;
  if (length >= 12 && length <= 36) {
    score += 20;
  } else if (length >= 8 && length <= 50) {
    score += 12;
    tips.push("题目长度可再精炼到 12-36 字。");
  } else {
    score += 6;
    tips.push("题目过短或过长，建议更聚焦。");
  }

  if (hasAnyToken(raw, relationTokens)) {
    score += 25;
  } else {
    tips.push("建议明确变量关系（如“X 对 Y 的影响”）。");
  }

  if (hasAnyToken(raw, scopeTokens)) {
    score += 20;
  } else {
    tips.push("建议补充研究场景或范围（地区/对象/时间）。");
  }

  if (hasAnyToken(normalized, methodTokens)) {
    score += 20;
  } else {
    tips.push("可加入方法线索（如实证、比较、模型、综述）。");
  }

  const vagueCount = vagueWords.reduce((count, word) => {
    return count + (normalized.includes(word.toLowerCase()) ? 1 : 0);
  }, 0);
  if (vagueCount >= 3) {
    score -= 10;
    tips.push("题目中泛化词较多，建议替换为具体对象与指标。");
  } else {
    score += 15;
  }

  score = clamp(Math.round(score), 0, 100);

  const level: TitleQualityResult["level"] =
    score >= 70 ? "strong" : score >= 40 ? "medium" : "weak";

  return {
    score,
    level,
    tips: tips.slice(0, 3),
  };
}

export function looksLikeStandaloneTitle(input: string) {
  const value = input.trim();
  if (!value) {
    return false;
  }

  if (value.length > 42) {
    return false;
  }

  if (/\n/.test(value)) {
    return false;
  }

  if (/请帮|帮我|如何|怎么|why|how|please/i.test(value)) {
    return false;
  }

  const punctuationCount = (value.match(/[，。！？,.!?;；:：]/g) ?? []).length;
  return punctuationCount <= 2;
}
