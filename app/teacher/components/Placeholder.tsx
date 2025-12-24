import Link from "next/link";

type Action = { href: string; label: string };

type PlaceholderProps = {
  title: string;
  description: string;
  hints?: string[];
  actions?: Action[];
};

export function Placeholder({ title, description, hints = [], actions = [] }: PlaceholderProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-800/40 to-slate-900/60 p-6 shadow-xl shadow-black/40 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Скоро здесь</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-slate-300">{description}</p>
      </div>
      {hints.length > 0 && (
        <div className="grid gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200">
          {hints.map((hint) => (
            <div key={hint} className="flex items-start gap-2">
              <span className="mt-[6px] h-2 w-2 rounded-full bg-emerald-400" />
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/30"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
