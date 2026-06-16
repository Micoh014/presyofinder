import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import { getPinColor, createColoredIcon } from "../../lib/mapUtils";

// SingleMarker is memoized — only re-renders if its own props change
const SingleMarker = memo(function SingleMarker({
  store,
  color,
  onStoreClick,
}) {
  // icon is stable as long as color doesn't change (iconCache handles the rest)
  const icon = createColoredIcon(color);

  // eventHandlers object is recreated here but SingleMarker is already
  // memo'd — the color key change is what drives re-renders, not this object
  const eventHandlers = useMemo(
    () => ({
      click: () => onStoreClick(store),
      mouseover: (e) => e.target.openPopup(),
      mouseout: (e) => e.target.closePopup(),
    }),
    [store, onStoreClick],
  );

  return (
    <Marker
      position={[store.latitude, store.longitude]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <Popup closeButton={false} autoPan={false}>
        <span className="text-sm font-medium">{store.name}</span>
      </Popup>
    </Marker>
  );
});

// StoreMarkers is memoized — won't re-render when unrelated Map state changes
// Map.jsx already passes filteredStores so no filtering needed here
const StoreMarkers = memo(function StoreMarkers({
  stores,
  searchResults,
  onStoreClick,
}) {
  return stores.map((store) => {
    const color = getPinColor(store, searchResults);
    return (
      <SingleMarker
        key={`${store.id}-${color}`}
        store={store}
        color={color}
        onStoreClick={onStoreClick}
      />
    );
  });
});

export default StoreMarkers;
