// components/ConversionControls.tsx
'use client';
import type { ConversionOptions } from '@/lib/types';

interface ConversionControlsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
}

export function ConversionControls({ options, onChange }: ConversionControlsProps) {
  const set = (patch: Partial<ConversionOptions>) =>
    onChange({ ...options, ...patch });

  const setResize = (patch: Partial<ConversionOptions['resize']>) =>
    onChange({ ...options, resize: { ...options.resize, ...patch } });

  const handleWidthChange = (rawValue: string) => {
    const w = rawValue === '' ? null : Math.max(1, parseInt(rawValue, 10));
    if (options.resize.lockAspectRatio && w && options.resize.width) {
      const ratio = w / options.resize.width;
      const h = options.resize.height ? Math.round(options.resize.height * ratio) : null;
      setResize({ width: w, height: h });
    } else {
      setResize({ width: w });
    }
  };

  const handleHeightChange = (rawValue: string) => {
    const h = rawValue === '' ? null : Math.max(1, parseInt(rawValue, 10));
    if (options.resize.lockAspectRatio && h && options.resize.height) {
      const ratio = h / options.resize.height;
      const w = options.resize.width ? Math.round(options.resize.width * ratio) : null;
      setResize({ height: h, width: w });
    } else {
      setResize({ height: h });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Quality */}
      <div>
        <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Quality</span>
          <span className="text-blue-600 font-semibold">{options.lossless ? 'Lossless' : `${options.quality}`}</span>
        </label>
        <input
          type="range" min={0} max={100} value={options.quality}
          disabled={options.lossless}
          onChange={(e) => set({ quality: parseInt(e.target.value, 10) })}
          className="w-full accent-blue-500 disabled:opacity-40"
        />
      </div>

      {/* Lossless */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox" checked={options.lossless}
          onChange={(e) => set({ lossless: e.target.checked })}
          className="w-4 h-4 accent-blue-500"
        />
        <span className="text-sm text-gray-700">Lossless</span>
      </label>

      {/* Strip Metadata */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox" checked={options.stripMetadata}
          onChange={(e) => set({ stripMetadata: e.target.checked })}
          className="w-4 h-4 accent-blue-500"
        />
        <span className="text-sm text-gray-700">Strip metadata (EXIF, GPS, etc.)</span>
      </label>

      {/* Resize */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox" checked={options.resize.enabled}
            onChange={(e) => setResize({ enabled: e.target.checked })}
            className="w-4 h-4 accent-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Resize</span>
        </label>

        {options.resize.enabled && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number" min={1} placeholder="Width"
              value={options.resize.width ?? ''}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Aspect ratio lock */}
            <button
              type="button"
              onClick={() => setResize({ lockAspectRatio: !options.resize.lockAspectRatio })}
              title={options.resize.lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              className={[
                'p-1.5 rounded-md border transition-colors',
                options.resize.lockAspectRatio
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-400',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {options.resize.lockAspectRatio ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                )}
              </svg>
            </button>
            <input
              type="number" min={1} placeholder="Height"
              value={options.resize.height ?? ''}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
        )}
      </div>
    </div>
  );
}
