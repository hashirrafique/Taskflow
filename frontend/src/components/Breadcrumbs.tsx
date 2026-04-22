'use client';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-400 mb-6 overflow-x-auto">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-white transition-colors flex-shrink-0">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-ink-600" />
          {c.href && i < items.length - 1 ? (
            <Link href={c.href} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
              {c.icon}
              {c.label}
            </Link>
          ) : (
            <span className="text-white font-medium flex items-center gap-1.5 whitespace-nowrap">
              {c.icon}
              {c.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
