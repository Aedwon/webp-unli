'use client';
import { CaretRightIcon, CircleNotchIcon, LockIcon, LockOpenIcon, LightningIcon } from '@phosphor-icons/react';
import type { ConversionOptions } from '@/lib/types';

export type Scope = 'all' | 'file';

interface SettingsPanelProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
  /** Show the All files / This file switch. */
  canScope: boolean;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  idleCount: number;
  converting: boolean;
  onConvert: () => void;
}

export function SettingsPanel({
  options,
  onChange,
  canScope,
  scope,
  onScopeChange,
  idleCount,
  converting,
  onConvert,
}: SettingsPanelProps) {
  const resizeOpen = options.resize.enabled;

  const set = (patch: Partial<ConversionOptions>) => onChange({ ...options, ...patch });
  const setResize = (patch: Partial<ConversionOptions['resize']>) =>
    onChange({ ...options, resize: { ...options.resize, ...patch } });

  const handleWidthChange = (raw: string) => {
    const w = raw === '' ? null : Math.max(1, parseInt(raw, 10));
    if (options.resize.lockAspectRatio && w && options.resize.width) {
      const ratio = w / options.resize.width;
      const h = options.resize.height ? Math.round(options.resize.height * ratio) : null;
      setResize({ width: w, height: h });
    } else {
      setResize({ width: w });
    }
  };

  const handleHeightChange = (raw: string) => {
    const h = raw === '' ? null : Math.max(1, parseInt(raw, 10));
    if (options.resize.lockAspectRatio && h && options.resize.height) {
      const ratio = h / options.resize.height;
      const w = options.resize.width ? Math.round(options.resize.width * ratio) : null;
      setResize({ height: h, width: w });
    } else {
      setResize({ height: h });
    }
  };

  const toggleResize = () => setResize({ enabled: !resizeOpen });

  const resizeSummary = !options.resize.enabled
    ? 'Original'
    : options.resize.width || options.resize.height
      ? `${options.resize.width ?? 'auto'} × ${options.resize.height ?? 'auto'}`
      : 'Set size';

  return (
    <aside
      aria-label="Settings"
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 shadow-raised"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-xl leading-7 font-semibold tracking-[-0.01em]">Settings</h2>
        {canScope && (
          <div role="radiogroup" aria-label="Apply settings to" className="grid grid-cols-2 gap-0.5 rounded-md bg-control p-0.5">
            {(
              [
                ['all', 'All files'],
                ['file', 'This file'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={scope === value}
                onClick={() => onScopeChange(value)}
                className={[
                  'h-8 rounded-sm text-[13px] font-medium',
                  scope === value ? 'bg-surface text-ink shadow-raised' : 'text-ink-2 hover:text-ink',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="quality" className="text-sm leading-5 font-medium">
            Quality
          </label>
          <span className="text-sm leading-5 font-semibold">{options.lossless ? 'Lossless' : options.quality}</span>
        </div>
        <input
          id="quality"
          type="range"
          min={0}
          max={100}
          value={options.quality}
          disabled={options.lossless}
          onChange={(e) => set({ quality: parseInt(e.target.value, 10) })}
          className="range"
          style={{ '--fill': `${options.quality}%` } as React.CSSProperties}
        />
        <div className="flex justify-between text-xs leading-4 text-ink-3">
          <span>Smaller file</span>
          <span>Sharper image</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-control">
        <SwitchRow label="Remove metadata" checked={options.stripMetadata} onChange={(v) => set({ stripMetadata: v })} />
        <Divider />
        <SwitchRow label="Lossless" checked={options.lossless} onChange={(v) => set({ lossless: v })} />
        <Divider />
        <button
          type="button"
          onClick={toggleResize}
          aria-expanded={resizeOpen}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm leading-5 hover:brightness-95"
        >
          Resize
          <span className="flex items-center gap-1 text-ink-3">
            {resizeSummary}
            <CaretRightIcon
              size={16}
              weight="bold"
              aria-hidden="true"
              className={`transition-transform duration-[240ms] ease-(--ease) ${resizeOpen ? 'rotate-90' : ''}`}
            />
          </span>
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-[240ms] ease-(--ease) ${resizeOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 pb-4">
              <NumberField label="Width" value={options.resize.width} onChange={handleWidthChange} tabbable={resizeOpen} />
              <button
                type="button"
                tabIndex={resizeOpen ? 0 : -1}
                onClick={() => setResize({ lockAspectRatio: !options.resize.lockAspectRatio })}
                aria-pressed={options.resize.lockAspectRatio}
                aria-label="Keep proportions"
                title="Keep proportions"
                className={[
                  'flex size-9 shrink-0 items-center justify-center rounded-md border',
                  options.resize.lockAspectRatio
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line bg-surface text-ink-2',
                ].join(' ')}
              >
                {options.resize.lockAspectRatio ? (
                  <LockIcon size={16} weight="bold" aria-hidden="true" />
                ) : (
                  <LockOpenIcon size={16} weight="bold" aria-hidden="true" />
                )}
              </button>
              <NumberField label="Height" value={options.resize.height} onChange={handleHeightChange} tabbable={resizeOpen} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs leading-4 text-ink-3">Nothing is uploaded. Files are converted on your device.</p>

      {(idleCount > 0 || converting) && (
        <button
          type="button"
          onClick={onConvert}
          disabled={converting}
          className="anim-stage flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-on-accent hover:brightness-95 disabled:opacity-70"
        >
          {converting ? (
            <CircleNotchIcon size={18} weight="bold" className="animate-[spin_700ms_linear_infinite]" aria-hidden="true" />
          ) : (
            <LightningIcon size={18} weight="fill" aria-hidden="true" />
          )}
          {converting ? 'Converting' : idleCount > 1 ? `Convert ${idleCount} images` : 'Convert'}
        </button>
      )}
    </aside>
  );
}

function Divider() {
  return <div className="ml-4 h-px bg-line" />;
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 px-4">
      <span id={`sw-${label}`} className="text-sm leading-5">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`sw-${label}`}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-[26px] w-11 shrink-0 rounded-full',
          checked ? 'bg-accent' : 'bg-line-strong',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)]',
            'transition-transform duration-[240ms] ease-(--spring)',
            checked ? 'translate-x-[18px]' : '',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  tabbable,
}: {
  label: string;
  value: number | null;
  onChange: (raw: string) => void;
  tabbable: boolean;
}) {
  return (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      placeholder={label}
      aria-label={`${label} in pixels`}
      tabIndex={tabbable ? 0 : -1}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm focus:border-accent"
    />
  );
}
