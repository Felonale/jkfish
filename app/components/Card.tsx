interface CardProps {
  title: string;
  description: string;
  percent?: number;
  eyebrow?: string;
  footer?: string;
  highlight?: string;
}

export default function Card({
  title,
  description,
  percent,
  eyebrow,
  footer,
  highlight,
}: CardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/40 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.45)]">
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.3em] text-violet-200 drop-shadow">
          {eyebrow}
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
        {highlight && (
          <span className="whitespace-nowrap rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100 text-center">
            {highlight}
          </span>
        )}
      </div>

      {typeof percent === 'number' && (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white">{percent}%</span>
        </div>
      )}

      {footer && <footer className="text-sm text-slate-500">{footer}</footer>}
    </article>
  );
}
