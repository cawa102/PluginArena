'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-[var(--muted)]">{t('subtitle')}</p>
      </div>

      {/* Rankings Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t('rankings.title')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Now */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[var(--primary)] text-white rounded-full text-sm font-semibold">
                Now
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('rankings.now.title')}</h3>
            <p className="text-sm text-[var(--muted)]">{t('rankings.now.desc')}</p>
            <div className="text-xs text-[var(--muted-light)] bg-[var(--secondary)] p-2 rounded">
              ELO 60% + Stars 40%
            </div>
          </div>

          {/* Trend */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[var(--success)] text-white rounded-full text-sm font-semibold">
                Trend
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('rankings.trend.title')}</h3>
            <p className="text-sm text-[var(--muted)]">{t('rankings.trend.desc')}</p>
            <div className="text-xs text-[var(--muted-light)] bg-[var(--secondary)] p-2 rounded">
              60-day Stars Growth
            </div>
          </div>

          {/* Classic */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[var(--warning)] text-white rounded-full text-sm font-semibold">
                Classic
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('rankings.classic.title')}</h3>
            <p className="text-sm text-[var(--muted)]">{t('rankings.classic.desc')}</p>
            <div className="text-xs text-[var(--muted-light)] bg-[var(--secondary)] p-2 rounded">
              Total GitHub Stars
            </div>
          </div>
        </div>
      </section>

      {/* ELO Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t('elo.title')}</h2>
        <div className="card p-6 space-y-4">
          <p className="text-[var(--muted)]">{t('elo.desc')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[var(--secondary)] p-4 rounded-lg">
              <p className="text-sm text-[var(--muted)]">{t('elo.initial')}</p>
              <p className="text-2xl font-bold">1500</p>
            </div>
            <div className="bg-[var(--secondary)] p-4 rounded-lg">
              <p className="text-sm text-[var(--muted)]">{t('elo.kFactor')}</p>
              <p className="text-2xl font-bold">K=32</p>
            </div>
            <div className="bg-[var(--secondary)] p-4 rounded-lg">
              <p className="text-sm text-[var(--muted)]">{t('elo.model')}</p>
              <p className="text-lg font-bold">Bradley-Terry</p>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">{t('elo.mechanism')}</p>
        </div>
      </section>

      {/* Voting Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t('voting.title')}</h2>
        <div className="card p-6 space-y-4">
          <p className="text-[var(--muted)]">{t('voting.desc')}</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <p className="text-sm text-[var(--muted)]">{t('voting.step1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <p className="text-sm text-[var(--muted)]">{t('voting.step2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <p className="text-sm text-[var(--muted)]">{t('voting.step3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Confidence Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t('confidence.title')}</h2>
        <div className="card p-6 space-y-4">
          <p className="text-[var(--muted)]">{t('confidence.desc')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-[var(--success)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--success)] font-bold">|||</span>
                <span className="font-semibold">High</span>
              </div>
              <p className="text-sm text-[var(--muted)]">{t('confidence.high')}</p>
            </div>
            <div className="border border-[var(--warning)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--warning)] font-bold">||</span>
                <span className="font-semibold">Medium</span>
              </div>
              <p className="text-sm text-[var(--muted)]">{t('confidence.medium')}</p>
            </div>
            <div className="border border-[var(--muted-light)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--muted-light)] font-bold">|</span>
                <span className="font-semibold">Low</span>
              </div>
              <p className="text-sm text-[var(--muted)]">{t('confidence.low')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center py-8">
        <Link href={`/${locale}/vote`} className="btn-primary text-lg px-8 py-3">
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
