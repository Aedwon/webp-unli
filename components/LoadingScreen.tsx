// components/LoadingScreen.tsx
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600 text-lg font-medium">Loading converter...</p>
      <p className="text-gray-400 text-sm mt-1">This only happens once</p>
    </div>
  );
}
