/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface NepalClockProps {
  compact?: boolean;
}

export const NepalClock: React.FC<NepalClockProps> = ({ compact = false }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateNepalTime = () => {
      const now = new Date();
      // Calculate exact UTC +5:45 (Nepal Standard Time - NST) mathematically
      // to ensure 100% accuracy across all device locales and browsers
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nepalOffsetMs = (5 * 60 + 45) * 60000; // 5 hours 45 minutes
      const nst = new Date(utcMs + nepalOffsetMs);

      const hoursRaw = nst.getHours();
      const hours12 = hoursRaw % 12 || 12;
      const minutes = String(nst.getMinutes()).padStart(2, '0');
      const seconds = String(nst.getSeconds()).padStart(2, '0');
      const ampm = hoursRaw >= 12 ? 'PM' : 'AM';

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[nst.getDay()];
      const monthName = months[nst.getMonth()];
      const dateNum = nst.getDate();
      const year = nst.getFullYear();

      setTimeStr(`${hours12}:${minutes}:${seconds} ${ampm}`);
      setDateStr(`${dayName}, ${monthName} ${dateNum}, ${year}`);
    };

    updateNepalTime();
    const interval = setInterval(updateNepalTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return null;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 tabular-nums select-none"
        title="Nepal Standard Time (UTC+05:45)"
        aria-label={`Current Nepal Standard Time: ${timeStr}, ${dateStr}`}
      >
        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
        <span className="font-semibold text-white">{timeStr}</span>
        <span className="text-[10px] text-cyan-400 font-bold">NST (+5:45)</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono tabular-nums shadow-sm select-none"
      title="Nepal Standard Time (Kathmandu, UTC+05:45)"
      aria-label={`Nepal Standard Time: ${timeStr}, ${dateStr}`}
    >
      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
      <span className="font-semibold text-zinc-100">{timeStr}</span>
      <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/50">
        NST (+5:45)
      </span>
      <span className="text-zinc-600">·</span>
      <span className="text-[11px] text-zinc-400 hidden sm:inline">{dateStr}</span>
    </div>
  );
};
