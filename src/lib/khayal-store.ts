import { useEffect, useState } from "react";
import game1 from "@/assets/game-1.jpg";
import game2 from "@/assets/game-2.jpg";
import game3 from "@/assets/game-3.jpg";
import game4 from "@/assets/game-4.jpg";

export type Game = {
  id: string;
  name: string;
  image: string;
  link: string;
  description: string;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
};

export type SiteData = {
  siteName: string;
  tagline: string;
  discordLink: string;
  games: Game[];
  features: Feature[];
};

const STORAGE_KEY = "khayal-site-data-v1";

export const defaultData: SiteData = {
  siteName: "Khayal Community",
  tagline: "مجتمع الخيال للألعاب — حيث يلتقي اللاعبون الحقيقيون",
  discordLink: "https://discord.gg/khayal",
  games: [
    { id: "1", name: "Fortnite", image: game1, link: "#", description: "باتل رويال أسطوري" },
    { id: "2", name: "Minecraft", image: game2, link: "#", description: "عالم لا حدود له" },
    { id: "3", name: "Valorant", image: game3, link: "#", description: "إطلاق نار تكتيكي" },
    { id: "4", name: "Warzone", image: game4, link: "#", description: "ساحة المعركة الحديثة" },
  ],
  features: [
    { id: "f1", title: "بطولات أسبوعية", description: "نظم بطولات وفز بجوائز قيمة", icon: "🏆" },
    { id: "f2", title: "فرق ومجموعات", description: "كوّن فريقك واطلع للقمة", icon: "⚔️" },
    { id: "f3", title: "مجتمع نشط", description: "آلاف اللاعبين العرب 24/7", icon: "🎮" },
    { id: "f4", title: "بث مباشر", description: "شاهد أفضل اللاعبين على الهواء", icon: "📡" },
  ],
};

export function loadData(): SiteData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: SiteData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("khayal-data-updated"));
}

export function useSiteData() {
  const [data, setData] = useState<SiteData>(defaultData);
  useEffect(() => {
    setData(loadData());
    const handler = () => setData(loadData());
    window.addEventListener("khayal-data-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("khayal-data-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [data, (d: SiteData) => { saveData(d); setData(d); }] as const;
}
