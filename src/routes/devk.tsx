import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useSiteData, defaultData, normalizeDigits } from "@/lib/khayal-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import {
  Users, ShoppingBag, Globe, Trophy, Gamepad2, Star, Settings,
  Package, LayoutDashboard, Eye, RefreshCw, ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/devk")({
  component: DevPanel,
});

function DevPanel() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");

  if (!authed) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#080c10] p-6">
        <div className="bg-[#0d1117] border border-[#22d3ee]/20 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-black text-white">لوحة المطور</h1>
            <p className="text-sm text-[#8b9ab0]">أدخل الكود 87</p>
          </div>
          <Input
            type="password"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code === "87") {
                setAuthed(true);
                toast.success("مرحباً بك");
              } else if (e.key === "Enter") {
                toast.error("كود خاطئ");
                setCode("");
              }
            }}
            className="text-center bg-[#161b22] border-[#30363d] text-white h-12"
            autoFocus
          />
          <Button className="w-full bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#080c10] font-black" onClick={() => {
            if (code === "87") { setAuthed(true); toast.success("مرحباً بك"); }
            else { toast.error("كود خاطئ"); setCode(""); }
          }}>
            دخول
          </Button>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [data, setData] = useSiteData();
  const [activeTab, setActiveTab] = useState("overview");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (patch: any) => setData({ ...data, ...patch });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: p } = await supabase.from("profiles").select("*");
      setProfiles(p || []);
      setLoading(false);
    };
    load();
  }, [activeTab]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#080c10] text-white">
      <Toaster richColors position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur border-b border-[#30363d] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#22d3ee]" />
          <span className="font-bold text-white">لوحة المطور</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setData(defaultData)}>
            <RefreshCw className="w-3 h-3 ml-1" /> استرجاع
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/" target="_blank"><Eye className="w-3 h-3 ml-1" /> عرض</a>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-48 bg-[#0d1117] border-l border-[#30363d] p-3 gap-1 h-screen sticky top-14">
          {[
            { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "site", label: "الموقع", icon: <Globe className="w-4 h-4" /> },
            { id: "games", label: "الألعاب", icon: <Gamepad2 className="w-4 h-4" /> },
            { id: "accounts", label: "الحسابات", icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-right ${activeTab === tab.id ? "bg-[#22d3ee]/15 text-[#22d3ee]" : "text-[#8b9ab0] hover:bg-white/5"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">نظرة عامة</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-8 h-8 text-[#22d3ee]" />
                    <div><p className="text-xs text-[#8b9ab0]">الألعاب</p><p className="text-2xl font-bold">{data.games.length}</p></div>
                  </div>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-[#10b981]" />
                    <div><p className="text-xs text-[#8b9ab0]">الأعضاء</p><p className="text-2xl font-bold">{loading ? "..." : profiles.length}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "site" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">إعدادات الموقع</h1>
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                <Label className="text-white mb-2 block">اسم الموقع</Label>
                <Input value={data.siteName} onChange={(e) => update({ siteName: e.target.value })} className="bg-[#161b22] border-[#30363d] text-white" />
              </div>
            </div>
          )}

          {(activeTab === "games" || activeTab === "accounts") && (
            <div className="text-center text-[#8b9ab0] py-20">قيد التطوير</div>
          )}
        </main>
      </div>
    </div>
  );
             }
