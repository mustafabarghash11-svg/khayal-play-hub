import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSiteData, defaultData, normalizeDigits, type Game, type ServerStat, type ServerPerk, type CustomSection, type Block } from "@/lib/khayal-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/devk")({
  head: () => ({ meta: [{ title: "Dev Panel" }, { name: "robots", content: "noindex" }] }),
  component: DevPanel,
});

function DevPanel() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");

  if (!authed) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cleaned = normalizeDigits(code).trim();
            const expected = (import.meta.env.VITE_DEVK_PIN as string | undefined)?.trim() || "87";
            if (cleaned && cleaned === expected) {
              setAuthed(true);
              toast.success("مرحباً بك");
            } else {
              toast.error("كود خاطئ");
            }
          }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 space-y-4"
        >
          <h1 className="text-2xl font-black text-center">🔒 دخول المطور</h1>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="الكود السري"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-lg"
            autoFocus
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            دخول
          </Button>
        </form>
        <Toaster richColors />
      </div>
    );
  }

  return <Panel />;
}

function Panel() {
  const [data, setData] = useSiteData();
  const update = (patch: Partial<typeof data>) => setData({ ...data, ...patch });

  // Games
  const updateGame = (id: string, patch: Partial<Game>) => update({ games: data.games.map((g) => g.id === id ? { ...g, ...patch } : g) });
  const deleteGame = (id: string) => update({ games: data.games.filter((g) => g.id !== id) });
  const addGame = () => update({ games: [...data.games, { id: Date.now().toString(), name: "لعبة جديدة", image: "https://placehold.co/600x800/0d3b3e/22d3ee?text=Game", link: "#", description: "وصف اللعبة" }] });

  // Server stats
  const updateStat = (id: string, patch: Partial<ServerStat>) => update({ serverStats: data.serverStats.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const deleteStat = (id: string) => update({ serverStats: data.serverStats.filter((s) => s.id !== id) });
  const addStat = () => update({ serverStats: [...data.serverStats, { id: Date.now().toString(), label: "تسمية", value: "0", icon: "📊" }] });

  // Server perks
  const updatePerk = (id: string, patch: Partial<ServerPerk>) => update({ serverPerks: data.serverPerks.map((p) => p.id === id ? { ...p, ...patch } : p) });
  const deletePerk = (id: string) => update({ serverPerks: data.serverPerks.filter((p) => p.id !== id) });
  const addPerk = () => update({ serverPerks: [...data.serverPerks, { id: Date.now().toString(), title: "ميزة جديدة", description: "وصف", icon: "✨" }] });

  // Custom sections
  const addSection = () => {
    const id = Date.now().toString();
    update({ customSections: [...data.customSections, { id, slug: `sec-${id}`, title: "قسم جديد", blocks: [] }] });
  };
  const updateSection = (id: string, patch: Partial<CustomSection>) => update({ customSections: data.customSections.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const deleteSection = (id: string) => update({ customSections: data.customSections.filter((s) => s.id !== id) });
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
    updateSection(sectionId, { blocks: sec.blocks.map((b) => b.id === blockId ? ({ ...b, ...patch } as Block) : b) });
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

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-black">⚙️ لوحة المطور</h1>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => { if (confirm("استرجاع الإعدادات الافتراضية؟")) { setData(defaultData); toast.success("تم"); } }}>استرجاع</Button>
            <Button asChild variant="outline"><a href="/">عرض الموقع</a></Button>
          </div>
        </div>

        {/* Site info */}
        <Section title="معلومات الموقع">
          <Field label="اسم الموقع"><Input value={data.siteName} onChange={(e) => update({ siteName: e.target.value })} /></Field>
          <Field label="الوصف"><Textarea value={data.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
          <Field label="رابط الديسكورد"><Input value={data.discordLink} onChange={(e) => update({ discordLink: e.target.value })} /></Field>
        </Section>

        {/* Games */}
        <Section title={`الألعاب (${data.games.length})`} action={<Button onClick={addGame} size="sm" className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" />لعبة</Button>}>
          {data.games.map((g) => (
            <div key={g.id} className="border border-border rounded-xl p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                <Input placeholder="الاسم" value={g.name} onChange={(e) => updateGame(g.id, { name: e.target.value })} />
                <Input placeholder="الرابط" value={g.link} onChange={(e) => updateGame(g.id, { link: e.target.value })} />
              </div>
              <ImageUpload value={g.image} onChange={(v) => updateGame(g.id, { image: v })} placeholder="رابط الصورة أو ارفع ملف" />
              <Input placeholder="الوصف" value={g.description} onChange={(e) => updateGame(g.id, { description: e.target.value })} />
              <Button variant="destructive" size="sm" onClick={() => deleteGame(g.id)}><Trash2 className="w-4 h-4 ml-1" />حذف</Button>
            </div>
          ))}
        </Section>

        {/* Server stats */}
        <Section title={`إحصائيات السيرفر (${data.serverStats.length})`} action={<Button onClick={addStat} size="sm" className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" />إحصائية</Button>}>
          {data.serverStats.map((s) => (
            <div key={s.id} className="border border-border rounded-xl p-4 grid grid-cols-[60px_1fr] gap-3 items-start">
              <Input value={s.icon} onChange={(e) => updateStat(s.id, { icon: e.target.value })} className="text-2xl text-center h-full" />
              <div className="space-y-2">
                <Input placeholder="القيمة (مثل 5,000+)" value={s.value} onChange={(e) => updateStat(s.id, { value: e.target.value })} />
                <Input placeholder="التسمية (مثل عضو)" value={s.label} onChange={(e) => updateStat(s.id, { label: e.target.value })} />
                <Button variant="destructive" size="sm" onClick={() => deleteStat(s.id)}><Trash2 className="w-4 h-4 ml-1" />حذف</Button>
              </div>
            </div>
          ))}
        </Section>

        {/* Server perks */}
        <Section title={`مميزات السيرفر (${data.serverPerks.length})`} action={<Button onClick={addPerk} size="sm" className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" />ميزة</Button>}>
          {data.serverPerks.map((p) => (
            <div key={p.id} className="border border-border rounded-xl p-4 grid grid-cols-[60px_1fr] gap-3 items-start">
              <Input value={p.icon} onChange={(e) => updatePerk(p.id, { icon: e.target.value })} className="text-2xl text-center h-full" />
              <div className="space-y-2">
                <Input placeholder="العنوان" value={p.title} onChange={(e) => updatePerk(p.id, { title: e.target.value })} />
                <Input placeholder="الوصف" value={p.description} onChange={(e) => updatePerk(p.id, { description: e.target.value })} />
                <Button variant="destructive" size="sm" onClick={() => deletePerk(p.id)}><Trash2 className="w-4 h-4 ml-1" />حذف</Button>
              </div>
            </div>
          ))}
        </Section>

        {/* Custom sections */}
        <Section title={`أقسام مخصصة (${data.customSections.length})`} action={<Button onClick={addSection} size="sm" className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" />قسم</Button>}>
          {data.customSections.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد أقسام بعد. أضف واحداً وابدأ بإضافة نصوص، صور، وأزرار.</p>}
          {data.customSections.map((sec, idx) => (
            <div key={sec.id} className="border-2 border-accent/30 rounded-2xl p-4 space-y-3 bg-background/40">
              <div className="flex items-center gap-2 flex-wrap">
                <Input value={sec.title} onChange={(e) => updateSection(sec.id, { title: e.target.value })} placeholder="عنوان القسم" className="flex-1 min-w-[150px] font-bold" />
                <Button size="icon" variant="outline" onClick={() => moveSection(sec.id, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => moveSection(sec.id, 1)} disabled={idx === data.customSections.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => deleteSection(sec.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2 pl-2 border-r-2 border-accent/20 pr-3">
                {sec.blocks.map((b, bi) => (
                  <div key={b.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent">{labelFor(b.type)}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(sec.id, b.id, -1)} disabled={bi === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(sec.id, b.id, 1)} disabled={bi === sec.blocks.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteBlock(sec.id, b.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    {b.type === "heading" && <Input value={b.text} onChange={(e) => updateBlock(sec.id, b.id, { text: e.target.value })} placeholder="عنوان" />}
                    {b.type === "text" && <Textarea value={b.text} onChange={(e) => updateBlock(sec.id, b.id, { text: e.target.value })} placeholder="نص" rows={3} />}
                    {b.type === "image" && (
                      <>
                        <ImageUpload value={b.src} onChange={(v) => updateBlock(sec.id, b.id, { src: v })} placeholder="رابط الصورة أو ارفع ملف" />
                        <Input value={b.alt} onChange={(e) => updateBlock(sec.id, b.id, { alt: e.target.value })} placeholder="وصف الصورة" />
                      </>
                    )}
                    {b.type === "button" && (
                      <>
                        <Input value={b.text} onChange={(e) => updateBlock(sec.id, b.id, { text: e.target.value })} placeholder="نص الزر" />
                        <Input value={b.link} onChange={(e) => updateBlock(sec.id, b.id, { link: e.target.value })} placeholder="الرابط" />
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => addBlock(sec.id, "heading")}>+ عنوان</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock(sec.id, "text")}>+ نص</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock(sec.id, "image")}>+ صورة</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock(sec.id, "button")}>+ زر</Button>
              </div>
            </div>
          ))}
        </Section>

        <p className="text-center text-xs text-muted-foreground pb-6">التغييرات تُحفظ تلقائياً</p>
      </div>
      <Toaster richColors />
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function labelFor(t: Block["type"]) {
  return t === "heading" ? "عنوان" : t === "text" ? "نص" : t === "image" ? "صورة" : "زر";
}
