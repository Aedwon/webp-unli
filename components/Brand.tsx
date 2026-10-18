import { InfinityIcon } from '@phosphor-icons/react';

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <InfinityIcon size={32} weight="bold" className="shrink-0 text-ink" aria-hidden="true" />
      <h1 className="text-[17px] leading-6 font-semibold tracking-[-0.01em] text-ink">
        Unlimited WebP Converter <span className="font-normal text-ink-3">by Aedwon</span>
      </h1>
    </div>
  );
}
