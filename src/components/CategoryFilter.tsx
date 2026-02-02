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
  color: string;
  activeColor: string;
}

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

const categories: CategoryOption[] = [
  {
    value: null,
    labelKey: 'all',
    icon: icons.all,
    color: '#94A3B8',
    activeColor: '#22D3EE',
  },
  {
    value: 'mcp',
    labelKey: 'MCP',
    icon: icons.mcp,
    color: '#22D3EE',
    activeColor: '#22D3EE',
  },
  {
    value: 'skill',
    labelKey: 'Skills',
    icon: icons.skill,
    color: '#8B5CF6',
    activeColor: '#8B5CF6',
  },
  {
    value: 'hook',
    labelKey: 'Hooks',
    icon: icons.hook,
    color: '#F97316',
    activeColor: '#F97316',
  },
  {
    value: 'command',
    labelKey: 'Commands',
    icon: icons.command,
    color: '#10B981',
    activeColor: '#10B981',
  },
];

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const t = useTranslations('category');

  return (
    <div
      className="inline-flex flex-wrap justify-center gap-2 p-2.5 bg-[#1E293B]/80 rounded-full border border-[#334155]"
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
            className={`category-filter-btn relative px-4 py-2 rounded-full text-xs font-pixel transition-all duration-200 flex items-center gap-2 border ${
              isSelected
                ? 'border-transparent shadow-lg'
                : 'border-transparent hover:bg-[#0F172A]'
            }`}
            style={{
              backgroundColor: isSelected ? `${cat.activeColor}20` : 'transparent',
              color: isSelected ? cat.activeColor : cat.color,
              boxShadow: isSelected ? `0 0 20px ${cat.activeColor}30` : 'none',
            }}
          >
            <span className={`flex-shrink-0 transition-transform ${isSelected ? 'scale-110' : ''}`}>
              {cat.icon}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
