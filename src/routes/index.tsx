import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteData } from "@/lib/khayal-store";
import { KhayalLogo } from "@/components/KhayalLogo";
import { SideNav } from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Khayal Community — مجتمع الخيال للألعاب" },
      { name: "description", content: "انضم إلى Khayal Community، أكبر مجتمع عربي للاعبين." },
    ],
  }),
  component: Home,
});

function Home() {
  const [data] = useSiteData();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SideNav />

      <header
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.10 0.03 200 / 0.7), oklch(0.18 0.04 200 / 0.85)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 text-7xl text-accent rotate-[-15deg] font-black">⚡</div>
          <div className="absolute bottom-20 right-10 text-7xl text-accent rotate-[20deg] font-black">⚡</div>
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <KhayalLogo className="h-32 w-32 mx-auto mb-8 animate-[pulse_3s_ease-in-out_infinite]" />
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-l from-accent via-primary to-accent bg-clip-text text-transparent">
              {data.siteName}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">{data.tagline}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base px-8 shadow-[0_0_40px_oklch(0.65_0.18_215/0.5)]">
              <a href={data.discordLink} target="_blank" rel="noreferrer">انضم للديسكورد</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 font-bold text-base px-8">
              <Link to="/games">شوف الألعاب</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Quick links to pages */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-6">
          <PageCard to="/games" label="الألعاب" desc="استعرض جميع الألعاب المتاحة" />
          <PageCard to="/features" label="المميزات" desc="اكتشف ما يميز مجتمعنا" />
          {data.customSections.map((s) => (
            <Link key={s.id} to="/s/$slug" params={{ slug: s.slug }} className="group block p-8 rounded-2xl bg-card border border-border hover:border-accent transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.18_215/0.4)]">
              <p className="text-accent text-xs font-bold tracking-widest mb-2">// SECTION</p>
              <h3 className="text-2xl font-black mb-1 group-hover:text-accent transition-colors">{s.title}</h3>
              <p className="text-sm text-muted-foreground">اضغط لعرض القسم</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {data.siteName}
      </footer>
    </div>
  );
}

function PageCard({ to, label, desc }: { to: "/games" | "/features"; label: string; desc: string }) {
  return (
    <Link to={to} className="group block p-8 rounded-2xl bg-card border border-border hover:border-accent transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.18_215/0.4)]">
      <p className="text-accent text-xs font-bold tracking-widest mb-2">// PAGE</p>
      <h3 className="text-2xl font-black mb-1 group-hover:text-accent transition-colors">{label}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
