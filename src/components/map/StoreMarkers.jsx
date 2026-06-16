import { Marker, Popup } from "react-leaflet";
import { getPinColor, createColoredIcon } from "../../lib/mapUtils";

export default function StoreMarkers({
  stores,
  searchResults,
  activeFilter,
  onStoreClick,
}) {
  return stores
    .filter((store) => activeFilter === "all" || store.type === activeFilter)
    .map((store) => (
      <Marker
        key={`${store.id}-${getPinColor(store, searchResults)}`}
        position={[store.latitude, store.longitude]}
        icon={createColoredIcon(getPinColor(store, searchResults))}
        eventHandlers={{
          click: () => onStoreClick(store),
          mouseover: (e) => e.target.openPopup(),
          mouseout: (e) => e.target.closePopup(),
        }}
      >
        <Popup closeButton={false} autoPan={false}>
          <span className="text-sm font-medium">{store.name}</span>
        </Popup>
      </Marker>
    ));
}
