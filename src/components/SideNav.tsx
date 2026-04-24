import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useSiteData } from "@/lib/khayal-store";
import { KhayalLogo } from "./KhayalLogo";

export function SideNav() {
  const [open, setOpen] = useState(false);
  const [data] = useSiteData();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        className="fixed top-5 right-5 z-40 p-3 rounded-xl bg-card/80 backdrop-blur border border-border hover:border-accent transition-colors"
      >
        <Menu className="w-6 h-6 text-accent" />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        dir="rtl"
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-2xl transition-transform duration-300 overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <KhayalLogo className="h-10 w-10" />
            <span className="font-bold">{data.siteName}</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="إغلاق" className="p-2 hover:text-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-5 space-y-1">
          <NavLink to="/" onClick={() => setOpen(false)}>الصفحة الرئيسية</NavLink>
          <NavLink to="/games" onClick={() => setOpen(false)}>الألعاب</NavLink>
          <NavLink to="/features" onClick={() => setOpen(false)}>المميزات</NavLink>

          {data.customSections.length > 0 && (
            <div className="pt-3 mt-3 border-t border-border">
              <p className="px-4 pb-2 text-xs text-muted-foreground tracking-widest">// أقسام</p>
              {data.customSections.map((s) => (
                <Link
                  key={s.id}
                  to="/s/$slug"
                  params={{ slug: s.slug }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          )}

          <a
            href={data.discordLink}
            target="_blank"
            rel="noreferrer"
            className="block mt-4 px-4 py-3 rounded-lg bg-accent text-accent-foreground text-center font-bold hover:bg-accent/90"
          >
            انضم للديسكورد
          </a>
          <Link
            to="/devk"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 mt-2 text-xs text-muted-foreground hover:text-accent text-center"
          >
            لوحة المطور
          </Link>
        </nav>
      </aside>
    </>
  );
}

function NavLink({ to, onClick, children }: { to: "/" | "/games" | "/features"; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={{ exact: true }}
      activeProps={{ className: "block px-4 py-3 rounded-lg text-base bg-accent/15 text-accent font-bold transition-colors" }}
      inactiveProps={{ className: "block px-4 py-3 rounded-lg text-base hover:bg-accent/10 hover:text-accent transition-colors" }}
    >
      {children}
    </Link>
  );
}
