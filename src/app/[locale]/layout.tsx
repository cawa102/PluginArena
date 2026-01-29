import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Nunito, M_PLUS_Rounded_1c, JetBrains_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';
import LocaleLayoutClient from './layout-client';

// Rounded sans-serif for the "ゆるい" aesthetic
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Japanese rounded font
const mplusRounded = M_PLUS_Rounded_1c({
  variable: '--font-mplus',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const metadata = messages.metadata as { title: string; description: string };

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as 'en' | 'ja')) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${nunito.variable} ${mplusRounded.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleLayoutClient locale={locale}>{children}</LocaleLayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
