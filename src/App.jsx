import Map from "./components/Map";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }} className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-1000 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">
              PresyoFinder
            </h1>
            <p className="text-xs text-gray-400">Your personal price map</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
  );
}

export default App;
