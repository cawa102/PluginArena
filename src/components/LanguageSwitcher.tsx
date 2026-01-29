'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/');
    if (routing.locales.includes(segments[1] as 'en' | 'ja')) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'en'
            ? 'bg-[var(--primary)] text-white'
            : 'hover:bg-[var(--secondary)]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-[var(--muted)]">/</span>
      <button
        onClick={() => switchLocale('ja')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'ja'
            ? 'bg-[var(--primary)] text-white'
            : 'hover:bg-[var(--secondary)]'
        }`}
        aria-label="Switch to Japanese"
      >
        JA
      </button>
    </div>
  );
}
