'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

export type ThreadMessage = {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderPractice: string;
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' · ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  referralId: string;
  initialMessages: ThreadMessage[];
  currentProviderId: string;
}

export default function MessageThread({ referralId, initialMessages, currentProviderId }: Props) {
  const supabase = useRef(createSupabaseClient()).current;
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);

    const { data: id, error: sendError } = await supabase.rpc('send_referral_message', {
      p_referral_id: referralId,
      p_sender_id: currentProviderId,
      p_content: content,
    });

    if (sendError || !id) {
      setError(sendError?.message ?? 'Failed to send message. Please try again.');
      setSending(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
        senderId: currentProviderId,
        senderName: 'You',
        senderPractice: '',
      },
    ]);
    setDraft('');
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Conversation</h3>
        <p className="text-xs text-slate-400 mt-0.5">Secure messaging between referring and receiving providers</p>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4 px-5 py-5 max-h-[420px] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">
            No messages yet — start the conversation below.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentProviderId;
          return (
            <div key={m.id} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {initialsOf(m.senderName)}
              </div>
              <div className={`flex flex-col max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-700">
                    {mine ? 'You' : m.senderName}
                    {!mine && m.senderPractice && (
                      <span className="text-slate-400 font-normal"> · {m.senderPractice}</span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400">{formatTimestamp(m.createdAt)}</span>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    mine
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/60">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a secure message…"
            rows={2}
            className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Press Enter to send, Shift+Enter for a new line</p>
      </div>
    </div>
  );
}
