import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSiteData, defaultData, type Game, type Feature } from "@/lib/khayal-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/devk")({
  head: () => ({ meta: [{ title: "Dev Panel" }, { name: "robots", content: "noindex" }] }),
  component: DevPanel,
});

function DevPanel() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [data, setData] = useSiteData();

  if (!authed) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code === "87") setAuthed(true);
            else toast.error("كود خاطئ");
          }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 space-y-4"
        >
          <h1 className="text-2xl font-black text-center">🔒 دخول المطور</h1>
          <Input
            type="password"
            placeholder="الكود السري"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-lg"
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            دخول
          </Button>
        </form>
        <Toaster />
      </div>
    );
  }

  const update = (patch: Partial<typeof data>) => setData({ ...data, ...patch });

  const updateGame = (id: string, patch: Partial<Game>) => {
    update({ games: data.games.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  };
  const deleteGame = (id: string) => update({ games: data.games.filter((g) => g.id !== id) });
  const addGame = () => {
    const ng: Game = { id: Date.now().toString(), name: "لعبة جديدة", image: "https://placehold.co/600x800/0d3b3e/fff?text=New", link: "#", description: "وصف" };
    update({ games: [...data.games, ng] });
  };

  const updateFeature = (id: string, patch: Partial<Feature>) => {
    update({ features: data.features.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  };
  const deleteFeature = (id: string) => update({ features: data.features.filter((f) => f.id !== id) });
  const addFeature = () => {
    update({ features: [...data.features, { id: Date.now().toString(), title: "ميزة جديدة", description: "وصف", icon: "✨" }] });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">⚙️ لوحة المطور</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setData(defaultData); toast.success("تم الاسترجاع"); }}>
              استرجاع الافتراضي
            </Button>
            <Button asChild variant="outline"><a href="/">عرض الموقع</a></Button>
          </div>
        </div>

        {/* Site info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">معلومات الموقع</h2>
          <div>
            <Label>اسم الموقع</Label>
            <Input value={data.siteName} onChange={(e) => update({ siteName: e.target.value })} />
          </div>
          <div>
            <Label>الشعار/الوصف</Label>
            <Textarea value={data.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </div>
          <div>
            <Label>رابط الديسكورد</Label>
            <Input value={data.discordLink} onChange={(e) => update({ discordLink: e.target.value })} />
          </div>
        </section>

        {/* Games */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">الألعاب ({data.games.length})</h2>
            <Button onClick={addGame} className="bg-accent text-accent-foreground">+ إضافة لعبة</Button>
          </div>
          <div className="space-y-4">
            {data.games.map((g) => (
              <div key={g.id} className="border border-border rounded-xl p-4 grid md:grid-cols-[100px_1fr_auto] gap-4 items-start">
                <img src={g.image} alt={g.name} className="w-full md:w-24 h-24 object-cover rounded-lg" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>الاسم</Label><Input value={g.name} onChange={(e) => updateGame(g.id, { name: e.target.value })} /></div>
                  <div><Label>الرابط</Label><Input value={g.link} onChange={(e) => updateGame(g.id, { link: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label>رابط الصورة</Label><Input value={g.image} onChange={(e) => updateGame(g.id, { image: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label>الوصف</Label><Input value={g.description} onChange={(e) => updateGame(g.id, { description: e.target.value })} /></div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteGame(g.id)}>حذف</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">المميزات ({data.features.length})</h2>
            <Button onClick={addFeature} className="bg-accent text-accent-foreground">+ إضافة ميزة</Button>
          </div>
          <div className="space-y-4">
            {data.features.map((f) => (
              <div key={f.id} className="border border-border rounded-xl p-4 grid md:grid-cols-[80px_1fr_auto] gap-4 items-center">
                <Input value={f.icon} onChange={(e) => updateFeature(f.id, { icon: e.target.value })} className="text-3xl text-center" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>العنوان</Label><Input value={f.title} onChange={(e) => updateFeature(f.id, { title: e.target.value })} /></div>
                  <div><Label>الوصف</Label><Input value={f.description} onChange={(e) => updateFeature(f.id, { description: e.target.value })} /></div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteFeature(f.id)}>حذف</Button>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground">التغييرات تُحفظ تلقائياً في المتصفح</p>
      </div>
      <Toaster />
    </div>
  );
}
