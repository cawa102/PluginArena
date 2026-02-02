'use client';

import { useTranslations } from 'next-intl';
import type { RankingType } from '@/types';

interface RankingTabsProps {
  selected: RankingType;
  onChange: (type: RankingType) => void;
}

interface TabConfig {
  value: RankingType;
  icon: React.ReactNode;
  color: string;
}

const tabData: TabConfig[] = [
  {
    value: 'now',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: '#22D3EE',
  },
  {
    value: 'trend',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: '#10B981',
  },
  {
    value: 'classic',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: '#FBBF24',
  },
];

export default function RankingTabs({ selected, onChange }: RankingTabsProps) {
  const t = useTranslations('ranking.tabs');

  const tabs = tabData.map((tab) => ({
    ...tab,
    label: t(tab.value),
    description: t(`${tab.value}Desc`),
  }));

  return (
    <div className="space-y-3">
      {/* Tab buttons */}
      <div
        className="inline-flex gap-1.5 p-1.5 bg-[#1E293B]/80 rounded-full border border-[#334155]"
        role="tablist"
        aria-label="Ranking type"
      >
        {tabs.map((tab) => {
          const isSelected = selected === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.value}`}
              className={`ranking-tab relative px-5 py-2 rounded-full text-xs font-pixel transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'shadow-lg'
                  : 'text-[#64748B] hover:text-white hover:bg-[#0F172A]'
              }`}
              style={{
                backgroundColor: isSelected ? `${tab.color}20` : 'transparent',
                color: isSelected ? tab.color : undefined,
                boxShadow: isSelected ? `0 0 20px ${tab.color}30` : 'none',
              }}
            >
              <span className={`transition-all ${isSelected ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected tab description */}
      <div
        className="flex items-center gap-2 text-sm text-[#64748B] pl-1"
        id={`tabpanel-${selected}`}
        role="tabpanel"
      >
        <svg className="w-4 h-4 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{tabs.find((t) => t.value === selected)?.description}</span>
      </div>
    </div>
  );
}
