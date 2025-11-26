'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react'; // или любую свою иконку

type SectionProps = {
    title: string;
    children: React.ReactNode;      // основное содержимое секции
    extra: React.ReactNode;         // дополнительная информация
};

export default function Section({ title, children, extra }: SectionProps) {
    const [open, setOpen] = useState(false);

    return (
        <section
            className="
        section
        rounded-xl border border-white/10
        bg-slate-900/60
        p-4
"
        >
            {/* Шапка секции = кнопка */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="
          flex w-full items-center justify-between gap-2
          text-left
          cursor-pointer
        "
                aria-expanded={open}
            >
                <span className="font-semibold text-sm text-white">
                    {title}
                </span>

                <span className="inline-flex items-center text-xs text-slate-300 gap-1">
                    <span>Дополнительно</span>
                    <ChevronDown
                        className={`
              h-4 w-4 transition-transform duration-200
              ${open ? 'rotate-180' : 'rotate-0'}
            `}
                    />
                </span>
            </button>

            {/* Основное содержимое секции */}
            <div className="mt-3 text-sm text-slate-200">
                {children}
            </div>

            {/* Доп. информация — выезжает вниз */}
            <div
                className={`
          overflow-hidden
          transition-[max-height,opacity,margin] duration-300
          ${open ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}
        `}
            >
                <div className="text-sm text-slate-300">
                    {extra}
                </div>
            </div>
        </section>
    );
}
