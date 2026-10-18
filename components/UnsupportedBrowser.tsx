export function UnsupportedBrowser() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas p-8 text-center">
      <h1 className="mb-2 text-xl leading-7 font-semibold text-ink">Browser not supported</h1>
      <p className="max-w-md text-sm leading-5 text-ink-2">
        This app needs WebAssembly. Try a recent version of Chrome, Firefox or Safari 16+.
      </p>
    </div>
  );
}
