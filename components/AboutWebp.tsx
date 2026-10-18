import { ArrowSquareOutIcon, BuildingsIcon, ImageSquareIcon, LightningIcon } from '@phosphor-icons/react/ssr';
import type { Icon } from '@phosphor-icons/react';

const ITEMS: { Icon: Icon; title: string; body: string }[] = [
  {
    Icon: ImageSquareIcon,
    title: 'What it is',
    body: 'An image format that handles photos and graphics. It supports transparency and animation, and can be lossy or lossless.',
  },
  {
    Icon: BuildingsIcon,
    title: 'Who made it',
    body: 'Google, in 2010. It grew out of the VP8 video codec from On2 Technologies, which Google had just acquired. It is open source.',
  },
  {
    Icon: LightningIcon,
    title: 'Why use it',
    body: 'Smaller files load faster. Google reports lossy WebP at 25 to 34 percent smaller than JPEG, and lossless at 26 percent smaller than PNG. Every current major browser can show it.',
  },
];

interface AboutWebpProps {
  /** stack: a narrow card for the sidebar. row: three columns for the empty state. */
  layout?: 'stack' | 'row';
}

export function AboutWebp({ layout = 'stack' }: AboutWebpProps) {
  return (
    <section
      aria-label="About WebP"
      className="rounded-xl border border-line bg-surface/70 p-5 shadow-raised"
    >
      <h2 className="mb-4 text-base leading-6 font-semibold tracking-[-0.01em]">About WebP</h2>
      <div className={layout === 'row' ? 'grid gap-6 sm:grid-cols-3' : 'flex flex-col gap-4'}>
        {ITEMS.map(({ Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-control text-ink">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[13px] leading-[18px] font-semibold">{title}</h3>
              <p className="text-[13px] leading-[18px] text-ink-2">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col items-center gap-2 border-t border-line pt-5 text-center">
        <p className="max-w-md text-[15px] leading-6 font-semibold tracking-[-0.01em] text-ink">
          Serving WebP on your website is a recommended way to speed up page loads.
        </p>
        <a
          href="https://developers.google.com/speed/webp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs leading-4 text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Read the WebP docs
          <ArrowSquareOutIcon size={12} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
