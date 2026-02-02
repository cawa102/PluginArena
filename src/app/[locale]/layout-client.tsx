'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LocaleLayoutClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();

  // Check if current route is active
  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}`;
    }
    return pathname.startsWith(path);
  };

  // Vote page has its own layout with sidebar
  const isVotePage = pathname.includes('/vote');
  if (isVotePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C] font-arcade">
      {/* Header with gaming glass effect */}
      <header className="sticky top-0 z-50 border-b border-[#1E293B]">
        {/* Glass background */}
        <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="group flex items-center gap-3"
            >
              {/* Logo icon */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] text-white shadow-lg shadow-[#22D3EE]/20 transition-transform duration-200 group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              {/* Logo text */}
              <div className="flex flex-col gap-0.5">
                <span className="font-pixel text-sm text-white group-hover:text-[#22D3EE] transition-colors">
                  Plugin Arena
                </span>
                <span className="text-[10px] text-[#22D3EE] hidden sm:block tracking-wider">
                  AI Agent Extensions
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {/* Ranking link */}
              <Link
                href={`/${locale}`}
                className={`relative px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive(`/${locale}`) && !pathname.includes('/vote')
                    ? 'text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline font-pixel text-[10px]">{t('nav.ranking')}</span>
                </span>
              </Link>

              {/* How it Works link */}
              <Link
                href={`/${locale}/how-it-works`}
                className={`relative px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive(`/${locale}/how-it-works`)
                    ? 'text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline font-pixel text-[10px]">{t('nav.howItWorks')}</span>
                </span>
              </Link>

              {/* Vote link - with neon highlight */}
              <Link
                href={`/${locale}/vote`}
                className={`relative px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive(`/${locale}/vote`)
                    ? 'text-white bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] shadow-lg shadow-[#22D3EE]/30'
                    : 'text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/30 hover:shadow-lg hover:shadow-[#22D3EE]/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-pixel text-[10px]">{t('nav.vote')}</span>
                </span>
              </Link>

              {/* Divider */}
              <div className="w-px h-6 bg-[#1E293B] mx-1 hidden sm:block" />

              {/* Language switcher */}
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0F172A]/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left side - branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-pixel text-xs text-white">Plugin Arena</p>
                <p className="text-[10px] text-[#64748B]">{t('footer.text')}</p>
              </div>
            </div>

            {/* Right side - links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#64748B] hover:text-[#22D3EE] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">GitHub</span>
              </a>
              <span className="w-px h-4 bg-[#1E293B]" />
              <span className="text-[#64748B] text-xs">
                Made with Claude Code
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
