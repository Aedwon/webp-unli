// components/ProgressBar.tsx
interface ProgressBarProps {
  value: number; // 0–100
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
