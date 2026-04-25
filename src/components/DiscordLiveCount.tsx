import { useEffect, useState } from "react";

export function DiscordLiveCount({ serverId }: { serverId: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!serverId) return;
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        if (!res.ok) throw new Error("widget disabled");
        const data = await res.json();
        if (!cancelled) setCount(data.presence_count ?? 0);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [serverId]);

  if (!serverId || error || count === null) return null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
      <div className="text-4xl mb-3">🟢</div>
      <div className="text-3xl md:text-4xl font-black text-accent mb-1 tabular-nums">
        {count.toLocaleString("en-US")}
      </div>
      <div className="text-sm text-muted-foreground">متصل الآن على Discord</div>
    </div>
  );
}
