import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  useSiteData,
  defaultData,
  normalizeDigits,
  type Game,
  type ServerStat,
  type ServerPerk,
  type CustomSection,
  type Block,
  type Streamer,
  type LeaderboardEntry,
  type HallOfFameEntry,
} from "@/lib/khayal-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import { toast, Toaster } from "sonner";
import {
  Trash2, Plus, ArrowUp, ArrowDown,
  Users, Coins, ShoppingBag, Globe,
  Trophy, Gamepad2, Star, Settings,
  Edit3, X, Check, Search, ChevronDown,
  Package, Shield, TrendingUp, Zap,
  LayoutDashboard, Eye, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/devk")({
  head: () => ({
    meta: [{ title: "لوحة المطور" }, { name: "robots", content: "noindex" }],
  }),
  component: DevPanel,
});

// --- Auth Gate --------------------------------------------------------------
function DevPanel() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  if (!authed) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#080c10] p-6"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(34,211,238,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.04) 0%, transparent 50%)",
        }}
      >
        <div
          className={`w-full max-w-sm ${shake ? "animate-[shake_0.4s_ease]" : ""}`}
          style={{
            animation: shake ? "shake 0.4s ease" : undefined,
          }}
        >
          <div className="bg-[#0d1117] border border-[#22d3ee]/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-[#22d3ee]/5">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-black text-white">لوحة المطور</h1>
              <p className="text-sm text-[#8b9ab0]">أدخل الكود للمتابعة</p>
            </div>
            <Input
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const cleaned = normalizeDigits(code).trim();
                  const expected =
                    (import.meta.env.VITE_DEVK_PIN as string | undefined)?.trim() || "87";
                  if (cleaned === expected) {
                    setAuthed(true);
                    toast.success("مرحباً بك 👋");
                  } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    toast.error("كود خاطئ");
                    setCode("");
                  }
                }
              }}
              className="text-center text-xl tracking-widest bg-[#161b22] border-[#30363d] text-white h-12"
              autoFocus
            />
            <Button
              className="w-full bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#080c10] font-black h-12 text-base"
              onClick={() => {
                const cleaned = normalizeDigits(code).trim();
                const expected =
                  (import.meta.env.VITE_DEVK_PIN as string | undefined)?.trim() || "87";
                if (cleaned === expected) {
                  setAuthed(true);
                  toast.success("مرحباً بك 👋");
                } else {
                  setShake(true);
                  setTimeout(() => setShake(false), 500);
                  toast.error("كود خاطئ");
                  setCode("");
                }
              }}
            >
              دخول
            </Button>
          </div>
        </div>
        <Toaster richColors position="top-center" />
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      </div>
    );
  }

  return <Panel />;
}

// --- Tab definitions ---------------------------------------------------------
type TabId = "overview" | "site" | "games" | "community" | "accounts" | "points" | "shop";

const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "site", label: "الموقع", icon: <Globe className="w-4 h-4" /> },
  { id: "games", label: "الألعاب", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: "community", label: "المجتمع", icon: <Trophy className="w-4 h-4" /> },
  { id: "accounts", label: "الحسابات", icon: <Users className="w-4 h-4" /> },
  { id: "points", label: "النقاط", icon: <Star className="w-4 h-4" /> },
  { id: "shop", label: "المتجر", icon: <ShoppingBag className="w-4 h-4" /> },
];

// --- Main Panel --------------------------------------------------------------
function Panel() {
  const [data, setData] = useSiteData();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const update = (patch: Partial<typeof data>) => setData({ ...data, ...patch });

  // Supabase data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [shopOrders, setShopOrders] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");

  const loadDB = useCallback(async () => {
    setLoadingDB(true);
    const [{ data: p }, { data: si }, { data: so }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_items").select("*").order("price_points"),
      supabase.from("shop_orders").select("*, shop_items(name), profiles(display_name)").order("created_at", { ascending: false }).limit(50),
    ]);
    setProfiles((p as any[]) ?? []);
    setShopItems((si as any[]) ?? []);
    setShopOrders((so as any[]) ?? []);
    setLoadingDB(false);
  }, []);

  useEffect(() => {
    if (["accounts", "points", "shop", "overview"].includes(activeTab)) {
      loadDB();
    }
  }, [activeTab, loadDB]);

  // Games handlers
  const updateGame = (id: string, patch: Partial<Game>) =>
    update({ games: data.games.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  const deleteGame = (id: string) =>
    update({ games: data.games.filter((g) => g.id !== id) });
  const addGame = () =>
    update({
      games: [...data.games, { id: Date.now().toString(), name: "لعبة جديدة", image: "https://placehold.co/600x800/0d3b3e/22d3ee?text=Game", link: "#", description: "وصف اللعبة" }],
    });

  // Stats handlers
  const updateStat = (id: string, patch: Partial<ServerStat>) =>
    update({ serverStats: data.serverStats.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const deleteStat = (id: string) =>
    update({ serverStats: data.serverStats.filter((s) => s.id !== id) });
  const addStat = () =>
    update({ serverStats: [...data.serverStats, { id: Date.now().toString(), label: "تسمية", value: "0", icon: "📊" }] });

  // Perks handlers
  const updatePerk = (id: string, patch: Partial<ServerPerk>) =>
    update({ serverPerks: data.serverPerks.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const deletePerk = (id: string) =>
    update({ serverPerks: data.serverPerks.filter((p) => p.id !== id) });
  const addPerk = () =>
    update({ serverPerks: [...data.serverPerks, { id: Date.now().toString(), title: "ميزة جديدة", description: "وصف", icon: "✨" }] });

  // Streamers handlers
  const updateStreamer = (id: string, patch: Partial<Streamer>) =>
    update({ streamers: data.streamers.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const deleteStreamer = (id: string) =>
    update({ streamers: data.streamers.filter((s) => s.id !== id) });
  const addStreamer = () =>
    update({ streamers: [...data.streamers, { id: Date.now().toString(), name: "اسم الستريمر", image: "", platform: "Twitch", link: "https://", isLive: false }] });

  // Leaderboard handlers
  const updateLeader = (id: string, patch: Partial<LeaderboardEntry>) =>
    update({ leaderboard: data.leaderboard.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const deleteLeader = (id: string) =>
    update({ leaderboard: data.leaderboard.filter((p) => p.id !== id) });
  const addLeader = () =>
    update({ leaderboard: [...data.leaderboard, { id: Date.now().toString(), rank: data.leaderboard.length + 1, name: "اسم اللاعب", image: "", points: 0, badge: "" }] });

  // Hall of fame handlers
  const updateHof = (id: string, patch: Partial<HallOfFameEntry>) =>
    update({ hallOfFame: data.hallOfFame.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const deleteHof = (id: string) =>
    update({ hallOfFame: data.hallOfFame.filter((c) => c.id !== id) });
  const addHof = () =>
    update({ hallOfFame: [...data.hallOfFame, { id: Date.now().toString(), championName: "اسم البطل", image: "", tournament: "اسم البطولة", year: new Date().getFullYear().toString() }] });

  // Custom sections handlers
  const addSection = () => {
    const id = Date.now().toString();
    update({ customSections: [...data.customSections, { id, slug: `sec-${id}`, title: "قسم جديد", blocks: [] }] });
  };
  const updateSection = (id: string, patch: Partial<CustomSection>) =>
    update({ customSections: data.customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const deleteSection = (id: string) =>
    update({ customSections: data.customSections.filter((s) => s.id !== id) });
  const moveSection = (id: string, dir: -1 | 1) => {
    const arr = [...data.customSections];
    const i = arr.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ customSections: arr });
  };
  const addBlock = (sectionId: string, type: Block["type"]) => {
    const id = Date.now().toString();
    let block: Block;
    if (type === "heading") block = { id, type, text: "عنوان جديد" };
    else if (type === "text") block = { id, type, text: "اكتب نصك هنا..." };
    else if (type === "image") block = { id, type, src: "https://placehold.co/800x500/0d3b3e/22d3ee?text=Image", alt: "صورة" };
    else block = { id, type, text: "اضغط هنا", link: "#" };
    updateSection(sectionId, { blocks: [...(data.customSections.find((s) => s.id === sectionId)?.blocks ?? []), block] });
  };
  const updateBlock = (sectionId: string, blockId: string, patch: Partial<Block>) => {
    const sec = data.customSections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, { blocks: sec.blocks.map((b) => (b.id === blockId ? ({ ...b, ...patch } as Block) : b)) });
  };
  const deleteBlock = (sectionId: string, blockId: string) => {
    const sec = data.customSections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, { blocks: sec.blocks.filter((b) => b.id !== blockId) });
  };
  const moveBlock = (sectionId: string, blockId: string, dir: -1 | 1) => {
    const sec = data.customSections.find((s) => s.id === sectionId);
    if (!sec) return;
    const arr = [...sec.blocks];
    const i = arr.findIndex((b) => b.id === blockId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    updateSection(sectionId, { blocks: arr });
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      !profileSearch ||
      p.display_name?.toLowerCase().includes(profileSearch.toLowerCase()) ||
      p.discord_username?.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#080c10] text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 10%, rgba(34,211,238,0.04) 0%, transparent 40%)",
      }}
    >
      <Toaster richColors position="top-center" />

      {/* -- Top Bar ------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur border-b border-[#30363d] px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#22d3ee]" />
          </div>
          <span className="font-black text-sm text-white">لوحة المطور</span>
          <span className="hidden sm:inline text-[#22d3ee] text-xs font-mono bg-[#22d3ee]/10 px-2 py-0.5 rounded-full">/devk</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8b9ab0] hover:text-white h-8 px-3 text-xs"
            onClick={() => { if (confirm("استرجاع الإعدادات الافتراضية؟")) { setData(defaultData); toast.success("تم الاسترجاع"); } }}
          >
            <RefreshCw className="w-3 h-3 ml-1" />
            استرجاع
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-[#8b9ab0] hover:text-white h-8 px-3 text-xs">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="w-3 h-3 ml-1" />
              عرض
            </a>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* -- Sidebar ------------------------------- */}
        <aside className="hidden md:flex flex-col w-52 sticky top-14 h-[calc(100vh-3.5rem)] bg-[#0d1117] border-l border-[#30363d] p-3 gap-1 overflow-y-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-right w-full ${
                activeTab === tab.id
                  ? "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/25"
                  : "text-[#8b9ab0] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={activeTab === tab.id ? "text-[#22d3ee]" : "text-[#8b9ab0]"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-[#30363d]">
            <p className="text-[10px] text-[#8b9ab0] text-center">التغييرات تُحفظ تلقائياً</p>
          </div>
        </aside>

        {/* -- Mobile tab picker ------------------- */}
        <div className="md:hidden sticky top-14 z-40 bg-[#0d1117] border-b border-[#30363d] w-full px-4 py-2">
          <button
            className="flex items-center justify-between w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="flex items-center gap-2 text-[#22d3ee] font-medium">
              {TABS.find((t) => t.id === activeTab)?.icon}
              {activeTabLabel}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#8b9ab0] transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-full right-0 left-0 bg-[#0d1117] border-b border-[#30363d] p-2 grid grid-cols-2 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    activeTab === tab.id ? "bg-[#22d3ee]/15 text-[#22d3ee]" : "text-[#8b9ab0] hover:bg-white/5"
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* -- Main content -------------------------- */}
        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6 max-w-4xl">

          {/* == OVERVIEW == */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <PageTitle icon="📊" title="نظرة عامة" subtitle="إحصائيات سريعة عن الموقع" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Gamepad2 className="w-5 h-5" />} label="الألعاب" value={data.games.length} color="#22d3ee" />
                <StatCard icon={<Users className="w-5 h-5" />} label="الأعضاء" value={profiles.length} color="#10b981" loading={loadingDB} />
                <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="منتجات المتجر" value={shopItems.length} color="#f59e0b" loading={loadingDB} />
                <StatCard icon={<Package className="w-5 h-5" />} label="الطلبات" value={shopOrders.length} color="#8b5cf6" loading={loadingDB} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card title="آخر الأعضاء" icon={<Users className="w-4 h-4 text-[#10b981]" />}>
                  {loadingDB ? <LoadingRows /> : profiles.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#21262d] last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#22d3ee]/20 flex items-center justify-center text-sm font-bold text-[#22d3ee]">
                        {p.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.display_name}</p>
                        <p className="text-xs text-[#8b9ab0]">مستوى {p.level} · {p.points} نقطة</p>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card title="آخر الطلبات" icon={<Package className="w-4 h-4 text-[#f59e0b]" />}>
                  {loadingDB ? <LoadingRows /> : shopOrders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#21262d] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{(o.shop_items as any)?.name ?? "—"}</p>
                        <p className="text-xs text-[#8b9ab0]">{(o.profiles as any)?.display_name ?? "—"}</p>
                      </div>
                      <OrderBadge status={o.status} />
                    </div>
                  ))}
                  {!loadingDB && shopOrders.length === 0 && <p className="text-sm text-[#8b9ab0] py-4 text-center">لا توجد طلبات</p>}
                </Card>
              </div>
            </div>
          )}

          {/* == SITE INFO == */}
          {activeTab === "site" && (
            <div className="space-y-5">
              <PageTitle icon="🌐" title="إعدادات الموقع" subtitle="المعلومات الأساسية والأقسام المخصصة" />

              <Card title="معلومات أساسية">
                <div className="space-y-4">
                  <Field label="اسم الموقع">
                    <Input value={data.siteName} onChange={(e) => update({ siteName: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="الوصف">
                    <Textarea valu
