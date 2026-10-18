import { InfinityIcon } from '@phosphor-icons/react/ssr';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-canvas">
      <InfinityIcon size={48} weight="bold" className="anim-float text-ink" aria-hidden="true" />
      <div className="text-center">
        <p className="text-base leading-6 font-medium text-ink">Getting the converter ready</p>
        <p className="text-sm leading-5 text-ink-3">First visit only. It is cached after this.</p>
      </div>
    </div>
  );
}
