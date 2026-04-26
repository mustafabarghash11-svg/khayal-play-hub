import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SideNav } from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background text-muted-foreground"><SideNav />جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <SideNav />
      <Toaster richColors position="top-center" />
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black mb-8">لوحة إدارة المجتمع</h1>
        <Tabs defaultValue="tournaments">
          <TabsList className="mb-6">
            <TabsTrigger value="tournaments">البطولات</TabsTrigger>
            <TabsTrigger value="shop">المتجر</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="points">منح نقاط</TabsTrigger>
          </TabsList>
          <TabsContent value="tournaments"><TournamentsAdmin /></TabsContent>
          <TabsContent value="shop"><ShopAdmin /></TabsContent>
          <TabsContent value="orders"><OrdersAdmin /></TabsContent>
          <TabsContent value="points"><PointsAdmin /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

// ============= TOURNAMENTS =============
function TournamentsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", game: "", description: "", image_url: "", start_date: "", max_participants: 16, prize: "", status: "open" });

  async function load() {
    const { data } = await supabase.from("tournaments").select("*").order("start_date", { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.title || !form.game || !form.start_date) return toast.error("املأ الحقول الأساسية");
    const { error } = await supabase.from("tournaments").insert({ ...form, status: form.status as any, max_participants: Number(form.max_participants) || 16 });
    if (error) toast.error(error.message); else { toast.success("تمت الإضافة"); setForm({ title: "", game: "", description: "", image_url: "", start_date: "", max_participants: 16, prize: "", status: "open" }); load(); }
  }
  async function remove(id: string) {
    if (!confirm("حذف البطولة؟")) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); load(); }
  }
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("tournaments").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <h3 className="font-black mb-2">إضافة بطولة</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>اللعبة</Label><Input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} /></div>
          <div><Label>التاريخ والوقت</Label><Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>الحد الأقصى</Label><Input type="number" min={2} value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: +e.target.value })} /></div>
          <div><Label>الجائزة</Label><Input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} /></div>
          <div><Label>رابط الصورة</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
        </div>
        <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <Button onClick={add} className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
      </div>

      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold truncate">{t.title} <span className="text-xs text-muted-foreground">· {t.game}</span></div>
              <div className="text-xs text-muted-foreground">{new Date(t.start_date).toLocaleString("ar")}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} className="bg-background border border-border rounded px-2 text-sm">
                <option value="upcoming">قادمة</option>
                <option value="open">مفتوحة</option>
                <option value="in_progress">جارية</option>
                <option value="completed">منتهية</option>
                <option value="cancelled">ملغاة</option>
              </select>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= SHOP =============
function ShopAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", image_url: "", price_points: 100, stock: -1, is_active: true });

  async function load() {
    const { data } = await supabase.from("shop_items").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.name) return toast.error("الاسم مطلوب");
    const { error } = await supabase.from("shop_items").insert({ ...form, price_points: Number(form.price_points), stock: Number(form.stock) });
    if (error) toast.error(error.message); else { toast.success("تمت الإضافة"); setForm({ name: "", description: "", image_url: "", price_points: 100, stock: -1, is_active: true }); load(); }
  }
  async function remove(id: string) {
    if (!confirm("حذف المنتج؟")) return;
    const { error } = await supabase.from("shop_items").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("حُذف"); load(); }
  }
  async function toggleActive(id: string, v: boolean) {
    await supabase.from("shop_items").update({ is_active: v }).eq("id", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <h3 className="font-black mb-2">إضافة منتج</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>الاسم</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>السعر بالنقاط</Label><Input type="number" min={0} value={form.price_points} onChange={(e) => setForm({ ...form, price_points: +e.target.value })} /></div>
          <div><Label>الكمية (-1 لا محدودة)</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
          <div><Label>رابط الصورة</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
        </div>
        <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <Button onClick={add} className="bg-accent text-accent-foreground"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
      </div>

      <div className="space-y-2">
        {list.map((it) => (
          <div key={it.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold truncate">{it.name}</div>
              <div className="text-xs text-muted-foreground">{it.price_points} نقطة · كمية: {it.stock < 0 ? "∞" : it.stock} {!it.is_active && "· معطل"}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => toggleActive(it.id, !it.is_active)}>{it.is_active ? "إخفاء" : "تفعيل"}</Button>
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= ORDERS =============
function OrdersAdmin() {
  const [list, setList] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase
      .from("shop_orders")
      .select("id, points_spent, status, user_notes, admin_notes, created_at, shop_items(name), user_id, profiles!inner(display_name, discord_username)")
      .order("created_at", { ascending: false });
    // profiles join via user_id requires foreign key — fallback simple query
    if (!data) {
      const { data: simple } = await supabase.from("shop_orders").select("*, shop_items(name)").order("created_at", { ascending: false });
      setList(simple ?? []);
    } else setList(data);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("shop_orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تحدّث"); load(); }
  }

  return (
    <div className="space-y-2">
      {list.length === 0 && <p className="text-muted-foreground text-center py-10">لا توجد طلبات.</p>}
      {list.map((o) => (
        <div key={o.id} className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="font-bold">{o.shop_items?.name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar")} · {o.points_spent} نقطة</div>
              {o.profiles && <div className="text-xs mt-1">العضو: <b>{o.profiles.display_name}</b> {o.profiles.discord_username && `· Discord: ${o.profiles.discord_username}`}</div>}
            </div>
            <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="bg-background border border-border rounded px-2 text-sm shrink-0">
              <option value="pending">قيد المعالجة</option>
              <option value="fulfilled">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          {o.user_notes && <div className="text-xs bg-background/50 rounded p-2 mt-2"><b>ملاحظة العضو:</b> {o.user_notes}</div>}
        </div>
      ))}
    </div>
  );
}

// ============= POINTS =============
function PointsAdmin() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [amount, setAmount] = useState(50);

  async function find() {
    const { data } = await supabase.from("profiles").select("user_id, display_name, points, level").ilike("display_name", `%${search}%`).limit(20);
    setResults(data ?? []);
  }
  async function award(userId: string, delta: number) {
    const { data: p } = await supabase.from("profiles").select("points").eq("user_id", userId).maybeSingle();
    if (!p) return toast.error("لم يُعثر");
    const { error } = await supabase.from("profiles").update({ points: Math.max(0, p.points + delta) }).eq("user_id", userId);
    if (error) toast.error(error.message); else { toast.success(`${delta > 0 ? "أضيف" : "خُصم"} ${Math.abs(delta)} نقطة`); find(); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <h3 className="font-black">منح / خصم نقاط</h3>
        <div className="flex gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم العضو..." />
          <Button onClick={find} className="bg-accent text-accent-foreground">بحث</Button>
        </div>
        <div className="flex items-center gap-2">
          <Label>الكمية:</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-32" />
        </div>
      </div>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.user_id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
            <div>
              <div className="font-bold">{r.display_name}</div>
              <div className="text-xs text-muted-foreground">Lv {r.level} · {r.points} نقطة</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => award(r.user_id, -amount)}>− {amount}</Button>
              <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => award(r.user_id, amount)}>+ {amount}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
