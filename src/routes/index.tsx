import { createFileRoute } from "@tanstack/react-router";
import { useSiteData, safeHref } from "@/lib/khayal-store";
import { KhayalLogo } from "@/components/KhayalLogo";
import { SideNav } from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { VisitorCounter } from "@/components/VisitorCounter";
import { DiscordLiveCount } from "@/components/DiscordLiveCount";
import { EventCountdown } from "@/components/EventCountdown";
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
          backgroundImage: `linear-gradient(180deg, oklch(0.14 0.04 200 / 0.75), oklch(0.18 0.04 200 / 0.9)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 text-center max-w-3xl">
          <KhayalLogo className="h-32 w-32 mx-auto mb-8 animate-[pulse_3s_ease-in-out_infinite]" />
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-l from-accent via-primary to-accent bg-clip-text text-transparent">
              {data.siteName}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">{data.tagline}</p>
          <div className="flex flex-col items-center gap-5">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base px-8 shadow-[0_0_40px_oklch(0.65_0.18_215/0.5)]">
              <a href={safeHref(data.discordLink)} target="_blank" rel="noreferrer">انضم للديسكورد</a>
            </Button>
            {data.showVisitorCounter && <VisitorCounter />}
          </div>
        </div>
      </header>

      {/* Event countdown */}
      {data.upcomingEvent && <EventCountdown event={data.upcomingEvent} />}

      {/* Live streamers */}
      {data.streamers.length > 0 && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// STREAMERS</p>
            <h2 className="text-3xl md:text-5xl font-black">المبدعون عندنا</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.streamers.map((s) => (
              <a
                key={s.id}
                href={safeHref(s.link)}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-accent transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.18_215/0.4)]"
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎮</div>
                  )}
                  {s.isLive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      LIVE
                    </div>
                  )}
                  {!s.isLive && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Offline
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black text-lg">{s.name}</h3>
                  {s.platform && <p className="text-xs text-muted-foreground mt-1">{s.platform}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Server stats + Discord live count */}
      {(data.serverStats.length > 0 || data.discordServerId) && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// STATS</p>
            <h2 className="text-3xl md:text-5xl font-black">إحصائيات السيرفر</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {data.discordServerId && <DiscordLiveCount serverId={data.discordServerId} />}
            {data.serverStats.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl bg-card border border-border p-6 text-center hover:border-accent transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.18_215/0.4)]"
              >
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-accent mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {data.leaderboard.length > 0 && (
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// LEADERBOARD</p>
            <h2 className="text-3xl md:text-5xl font-black">أفضل اللاعبين</h2>
          </div>
          <div className="space-y-3">
            {[...data.leaderboard].sort((a, b) => a.rank - b.rank).map((p) => {
              const medal = p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4 hover:border-accent transition-all"
                >
                  <div className="text-3xl font-black w-14 text-center">{medal}</div>
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-muted shrink-0">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black truncate">{p.name}</div>
                    {p.badge && <div className="text-xs text-accent">{p.badge}</div>}
                  </div>
                  <div className="text-2xl font-black text-accent tabular-nums">
                    {p.points.toLocaleString("en-US")}
                    <span className="text-xs text-muted-foreground font-normal mr-1">نقطة</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hall of Fame */}
      {data.hallOfFame.length > 0 && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// HALL OF FAME</p>
            <h2 className="text-3xl md:text-5xl font-black">قاعة الأبطال</h2>
            <p className="text-muted-foreground mt-3">أبطال البطولات السابقة</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.hallOfFame.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/30 p-6 text-center hover:border-accent transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">🏆</div>
                <div className="h-24 w-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted ring-2 ring-accent/40">
                  {c.image ? (
                    <img src={c.image} alt={c.championName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👑</div>
                  )}
                </div>
                <h3 className="font-black text-lg">{c.championName}</h3>
                <p className="text-sm text-accent mt-1">{c.tournament}</p>
                {c.year && <p className="text-xs text-muted-foreground mt-1">{c.year}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Server perks */}
      {data.serverPerks.length > 0 && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-widest text-sm mb-3">// PERKS</p>
            <h2 className="text-3xl md:text-5xl font-black">مميزات السيرفر</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {data.serverPerks.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-card border border-border p-6 flex gap-4 items-start hover:border-accent transition-all"
              >
                <div className="text-4xl shrink-0">{p.icon}</div>
                <div>
                  <h3 className="text-xl font-black mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {data.siteName}
      </footer>
    </div>
  );
}
