import React from 'react';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  sent: boolean;
  timestamp: string;
  showDelivered?: boolean;
};

export const MessageBubble: React.FC<Props> = ({ children, sent, timestamp, showDelivered }) => (
  <div className={`flex ${sent ? 'justify-end' : 'justify-start'} animate-fade-in`}>
    <div
      className={`px-4 py-3 rounded-2xl shadow-md max-w-[88%] sm:max-w-[75%] ${
        sent
          ? 'bg-brandTeal text-white rounded-br-md'
          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600 rounded-bl-md text-textPrimary dark:text-slate-100'
      }`}
    >
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{children}</div>
      <span
        className={`text-[11px] mt-2 flex items-center gap-1 ${sent ? 'text-white/75' : 'text-textSecondary dark:text-slate-400'}`}
      >
        {timestamp}
        {sent && showDelivered && <CheckCircle2 className="inline h-3 w-3 shrink-0" aria-hidden />}
      </span>
    </div>
  </div>
);

export default MessageBubble;
