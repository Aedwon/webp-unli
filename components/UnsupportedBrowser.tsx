// components/UnsupportedBrowser.tsx
export function UnsupportedBrowser() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Browser not supported</h1>
      <p className="text-gray-600 max-w-md">
        Your browser doesn&apos;t support this app. Please use a modern browser like{' '}
        <strong>Chrome</strong>, <strong>Firefox</strong>, or <strong>Safari 16+</strong>.
      </p>
    </div>
  );
}
