"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

export type MapPositions = {
  lat: number;
  lng: number;
};

interface MapProps {}

const DEFAULT_CENTER: MapPositions = {
  lat: 36.69737309552491,
  lng: 52.63486879330327,
};

const Map = ({}: MapProps) => {
  const [marketIcon, setMarketIcon] = useState<L.Icon | undefined>(undefined);
  const [shouldRenderMap, setShouldRenderMap] = useState<boolean>(true);

  useEffect(() => {
    // 1. Instantiation of custom map assets
    const platformIcon = new L.Icon({
      iconUrl: "/icons/location-icon.png",
      iconSize: [70, 70],
      iconAnchor: [35, 60],
      popupAnchor: [0, 0],
    });
    setMarketIcon(platformIcon);

    // 2. Clear out lingering instances attached to the target map DOM container ID node on HMR saves
    return () => {
      // Find the element Leaflet targets and force a complete wipeout of its inner node structure
      const mapContainerNode = L.DomUtil.get("unixsee-leaflet-map-wrapper");
      if (mapContainerNode) {
        // @ts-ignore - Wipe the structural framework pointer identifier internal property
        mapContainerNode._leaflet_id = null;
      }
    };
  }, []);

  // 3. Fast-Refresh Safety: Resets the entire sub-tree container on HMR events
  useEffect(() => {
    setShouldRenderMap(true);
    return () => {
      setShouldRenderMap(false);
    };
  }, []);

  if (!shouldRenderMap) {
    return (
      <div className="h-full w-full animate-pulse rounded bg-slate-100 dark:bg-zinc-950/40" />
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded">
      <MapContainer
        id="unixsee-leaflet-map-wrapper" // Named structural fallback binding element
        center={DEFAULT_CENTER}
        zoom={16}
        className="z-1 h-full w-full"
        attributionControl={false}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {marketIcon && (
          <Marker
            position={DEFAULT_CENTER}
            draggable={false}
            icon={marketIcon}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;

// "use client";

// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import L from "leaflet";
// import { marker } from "leaflet";

// import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
// import "leaflet-defaulticon-compatibility";

// export type MapPositions = {
//   lat: number;
//   lng: number;
// };

// interface MapProps {}

// const DEFAULT_CENTER: MapPositions = {
//   lat: 36.69737309552491,
//   lng: 52.63486879330327,
// };

// const Map = ({}: MapProps) => {
//   const [marketIcon, setMarketIcon] = useState<L.Icon | undefined>(undefined);

//   useEffect(() => {
//     // Generate the asset instance strictly within the browser environment lifecycle
//     const platformIcon = new L.Icon({
//       iconUrl: "/icons/location-icon.png",
//       iconSize: [70, 70],
//       iconAnchor: [35, 60],
//       popupAnchor: [0, 0],
//     });

//     setMarketIcon(platformIcon);
//   }, []);

//   return (
//     <div className="h-full w-full overflow-hidden rounded">
//       <MapContainer
//         center={DEFAULT_CENTER}
//         zoom={16}
//         className="z-1 h-full w-full"
//         attributionControl={false}
//         zoomControl={false}
//         dragging={false}
//         scrollWheelZoom={false}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Render marker only after custom icon instance safely resolves inside internal state */}
//         {marketIcon && (
//           <Marker
//             position={DEFAULT_CENTER}
//             draggable={false}
//             icon={marketIcon}
//           />
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default Map;

// "use client";

// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// // import { marker } from "leaflet";

// import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
// import "leaflet-defaulticon-compatibility";

// let Icon: any;
// let marketIcon: any;

// if (typeof window !== "undefined") {
//   import("leaflet").then((mod) => {
//     Icon = mod.Icon;
//     marketIcon = new Icon({
//       iconUrl: "/icons/location-shadow.svg",
//       iconSize: [70, 70],
//       iconAnchor: [35, 60],
//       popupAnchor: [0, 0],
//     });
//   });
// }

// export type MapPositions = {
//   lat: number;
//   lng: number;
// };

// interface MapProps {
//   // posix: MapPositions;
//   // zoom?: number;
//   // onAddressChange?: (address: string) => void;
//   // isInputFocused?: boolean;
//   // setCenterCoordinates?: Dispatch<
//   //   SetStateAction<{
//   //     lat: number;
//   //     lng: number;
//   //   }>
//   // >;
//   // draggable?: boolean;
//   // scrollZoom?: boolean;
//   // markerTooltip?: string;
//   // form?: any;
//   // mapCenterCoordinates?: { lat: number; lng: number } | null;
// }

// const defaults = {
//   zoom: 10,
// };

// const Map = (Mapp: MapProps) => {
//   // const {
//   //   zoom = defaults.zoom,
//   //   posix,

//   //   draggable = true,
//   //   scrollZoom = true,
//   // } = Mapp;
//   // const [position, setPosition] = useState<MapPositions>(
//   //   posix,
//   //   // { lng: 15.7219, lat: 51.3347 },
//   // );

//   return (
//     <MapContainer
//       // key={posix.lat}
//       center={{ lat: 35.715298, lng: 51.404343 }}
//       // zoom={zoom}
//       className="z-1"
//       style={{ height: "200px", width: "200px" }}
//       attributionControl={false}
//       zoomControl={false}
//       // dragging={draggable}
//       // scrollWheelZoom={scrollZoom}
//       // dragging={onAddressChange ? true : false}
//       // scrollWheelZoom={onAddressChange ? true : false}
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       <Marker
//         position={{ lat: 35.715298, lng: 51.404343 }}
//         draggable={false}
//         icon={marketIcon}
//       >
//         {/* {markerTooltip && (
//           <Popup>
//             <span className='!font-sans !text-xs'>انتخاب موقعیت</span>
//           </Popup>
//         )} */}
//       </Marker>
//     </MapContainer>
//   );
// };

// export default Map;
