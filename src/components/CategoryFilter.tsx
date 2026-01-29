'use client';

import { useTranslations } from 'next-intl';
import type { PluginCategory } from '@/types';

interface CategoryFilterProps {
  selected: PluginCategory | null;
  onChange: (category: PluginCategory | null) => void;
}

interface CategoryOption {
  value: PluginCategory | null;
  labelKey: string;
  icon: React.ReactNode;
  color: {
    active: string;
    inactive: string;
    iconBg: string;
  };
}

// SVG icons for each category
const icons = {
  all: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  mcp: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  skill: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  hook: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  command: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

// Using pastel category colors from the ゆるい design system
const categories: CategoryOption[] = [
  {
    value: null,
    labelKey: 'all',
    icon: icons.all,
    color: {
      active: 'bg-[var(--primary)] text-[var(--foreground)] shadow-md',
      inactive: 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)]',
      iconBg: 'bg-[var(--primary-light)]',
    },
  },
  {
    value: 'mcp',
    labelKey: 'MCP',
    icon: icons.mcp,
    color: {
      active: 'bg-[var(--category-mcp)] text-[#4A90A4] shadow-md',
      inactive: 'category-mcp hover:scale-102',
      iconBg: 'bg-[var(--category-mcp)]/30',
    },
  },
  {
    value: 'skill',
    labelKey: 'Skills',
    icon: icons.skill,
    color: {
      active: 'bg-[var(--category-skill)] text-[#8B6B9C] shadow-md',
      inactive: 'category-skill hover:scale-102',
      iconBg: 'bg-[var(--category-skill)]/30',
    },
  },
  {
    value: 'hook',
    labelKey: 'Hooks',
    icon: icons.hook,
    color: {
      active: 'bg-[var(--category-hook)] text-[#C48B6A] shadow-md',
      inactive: 'category-hook hover:scale-102',
      iconBg: 'bg-[var(--category-hook)]/30',
    },
  },
  {
    value: 'command',
    labelKey: 'Commands',
    icon: icons.command,
    color: {
      active: 'bg-[var(--category-command)] text-[#5A9A82] shadow-md',
      inactive: 'category-command hover:scale-102',
      iconBg: 'bg-[var(--category-command)]/30',
    },
  },
];

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const t = useTranslations('category');

  return (
    <div
      className="inline-flex flex-wrap justify-center gap-2 p-2.5 bg-[var(--card)]/80 rounded-full border border-[var(--border)] shadow-sm"
      role="group"
      aria-label={t('filter')}
    >
      {categories.map((cat) => {
        const isSelected = selected === cat.value;
        const label = cat.value === null ? t('all') : cat.labelKey;

        return (
          <button
            key={cat.value ?? 'all'}
            onClick={() => onChange(cat.value)}
            aria-pressed={isSelected}
            className={`category-filter-btn relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
              isSelected
                ? `${cat.color.active} scale-105 border-transparent`
                : `${cat.color.inactive} border-transparent hover:border-[var(--border)]`
            }`}
          >
            {/* Icon */}
            <span className={`flex-shrink-0 transition-transform ${isSelected ? 'scale-110' : ''}`}>
              {cat.icon}
            </span>

            {/* Label */}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
