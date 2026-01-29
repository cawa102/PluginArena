'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Comment } from '@/types';

interface CommentSectionProps {
  pluginId: string;
}

export default function CommentSection({ pluginId }: CommentSectionProps) {
  const t = useTranslations('comments');
  const tTime = useTranslations('time');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return tTime('justNow');
    if (minutes < 60) return tTime('minutesAgo', { minutes });
    if (hours < 24) return tTime('hoursAgo', { hours });
    if (days < 7) return tTime('daysAgo', { days });

    return date.toLocaleDateString();
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?pluginId=${pluginId}&limit=5`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(t('errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [pluginId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginId,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : t('errorPost'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1"
      >
        <span>{t('button')}</span>
        {comments.length > 0 && <span>({comments.length})</span>}
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border)]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">{t('title', { count: comments.length })}</h4>
        <button
          onClick={() => setExpanded(false)}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm"
        >
          {t('close')}
        </button>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="text-[var(--muted)] text-sm">{t('loading')}</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-[var(--muted)] text-sm">{t('empty')}</div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="text-sm">
              <p className="text-[var(--foreground)]">{comment.content}</p>
              <p className="text-[var(--muted)] text-xs mt-1">{formatDate(comment.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Post form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('placeholder')}
          maxLength={1000}
          className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {submitting ? '...' : t('submit')}
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
