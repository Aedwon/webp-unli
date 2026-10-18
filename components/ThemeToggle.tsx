'use client';
import { useSyncExternalStore } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { getServerTheme, getTheme, setTheme, subscribeTheme, type Theme } from '@/lib/theme';

const OPTIONS: { value: Theme; label: string; Icon: Icon }[] = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'system', label: 'Match system', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex h-10 items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-raised"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={[
              'flex size-9 items-center justify-center rounded-full',
              active ? 'bg-accent text-on-accent' : 'text-ink-2 hover:text-ink',
            ].join(' ')}
          >
            <Icon size={18} weight={active ? 'bold' : 'regular'} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
