import { createFileRoute } from "@tanstack/react-router";
import { useSiteData } from "@/lib/khayal-store";
import { KhayalLogo } from "@/components/KhayalLogo";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Khayal Community — مجتمع الخيال للألعاب" },
      { name: "description", content: "انضم إلى Khayal Community، أكبر مجتمع عربي للاعبين. بطولات، فرق، وأفضل الألعاب." },
      { property: "og:title", content: "Khayal Community" },
      { property: "og:description", content: "مجتمع الخيال للألعاب" },
    ],
  }),
  component: Home,
});

function Home() {
  const [data] = useSiteData();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <header
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.10 0.03 200 / 0.7), oklch(0.18 0.04 200 / 0.85)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* graffiti accents */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 text-7xl text-accent rotate-[-15deg] font-black">⚡</div>
          <div className="absolute bottom-20 right-10 text-7xl text-accent rotate-[20deg] font-black">⚡</div>
        </div>

        <nav className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-5 z-10">
          <div className="flex items-center gap-3">
            <KhayalLogo className="h-12 w-12" />
            <span className="font-bold text-lg tracking-wide">{data.siteName}</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <a href="#games" className="hover:text-accent transition-colors">الألعاب</a>
            <a href="#features" className="hover:text-accent transition-colors">المميزات</a>
            <a href={data.discordLink} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">انضم</a>
          </div>
        </nav>

        <div className="relative z-10 text-center max-w-3xl">
          <KhayalLogo className="h-32 w-32 mx-auto mb-8 animate-[pulse_3s_ease-in-out_infinite]" />
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-l from-accent via-primary to-accent bg-clip-text text-transparent">
              {data.siteName}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            {data.tagline}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base px-8 shadow-[0_0_40px_oklch(0.65_0.18_215/0.5)]">
              <a href={data.discordLink} target="_blank" rel="noreferrer">انضم للديسكورد</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 font-bold text-base px-8">
              <a href="#games">شوف الألعاب</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Games */}
      <section id="games" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent font-bold tracking-widest text-sm mb-3">// GAMES</p>
          <h2 className="text-4xl md:text-5xl font-black">ألعابنا</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.games.map((g) => (
            <a
              key={g.id}
              href={g.link}
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-accent transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-10px_oklch(0.65_0.18_215/0.5)]"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={g.image}
                  alt={g.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-background via-background/90 to-transparent">
                <h3 className="text-xl font-black mb-1">{g.name}</h3>
                <p className="text-sm text-muted-foreground">{g.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-black">ليش Khayal؟</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.features.map((f) => (
              <div
                key={f.id}
                className="p-8 rounded-2xl bg-card border border-border hover:border-accent transition-all hover:shadow-[0_0_40px_oklch(0.65_0.18_215/0.2)]"
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">جاهز تنضم؟</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">آلاف اللاعبين بانتظارك في أكبر مجتمع عربي</p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-10 shadow-[0_0_50px_oklch(0.65_0.18_215/0.6)]">
          <a href={data.discordLink} target="_blank" rel="noreferrer">انضم الآن</a>
        </Button>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {data.siteName} — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
