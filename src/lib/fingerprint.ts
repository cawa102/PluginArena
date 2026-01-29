/**
 * 投票者の識別（Cookie + IPベース）
 */
import { headers, cookies } from 'next/headers';
import crypto from 'crypto';

const FINGERPRINT_COOKIE_NAME = 'pa_fp';
const FINGERPRINT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

/**
 * フィンガープリントを生成
 */
function generateFingerprint(): string {
  return crypto.randomUUID();
}

/**
 * フィンガープリントを取得または生成
 * サーバーサイドで使用
 */
export async function getFingerprint(): Promise<string> {
  const cookieStore = await cookies();
  const existingFp = cookieStore.get(FINGERPRINT_COOKIE_NAME)?.value;

  if (existingFp) {
    return existingFp;
  }

  // 新しいフィンガープリントを生成
  const newFp = generateFingerprint();

  // Cookieに保存（次回のリクエストで使用される）
  cookieStore.set(FINGERPRINT_COOKIE_NAME, newFp, {
    maxAge: FINGERPRINT_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return newFp;
}

/**
 * IPアドレスを取得
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Vercelなどのプロキシ経由の場合
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * フィンガープリントとIPを組み合わせたハッシュを生成
 */
export async function getVoterHash(): Promise<string> {
  const fp = await getFingerprint();
  const ip = await getClientIP();

  const hash = crypto.createHash('sha256');
  hash.update(`${fp}:${ip}`);

  return hash.digest('hex');
}

/**
 * 投票レート制限をチェック
 * 同一ペアに対して24時間以内に投票していないかを確認
 */
export function isWithin24Hours(lastVoteTime: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - lastVoteTime.getTime();
  const hours24 = 24 * 60 * 60 * 1000;

  return diff < hours24;
}
