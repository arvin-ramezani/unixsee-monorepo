"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

export type MapPositions = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: MapPositions = {
  lat: 36.69737309552491,
  lng: 52.63486879330327,
};

// `L.Icon` only stores options, so it is safe to build once at module scope —
// this module is already client-only (Leaflet reads `window` on import, which is
// why every consumer must load it through `dynamic(..., { ssr: false })`).
const MARKER_ICON = new L.Icon({
  iconUrl: "/icons/location-icon.png",
  iconSize: [70, 70],
  iconAnchor: [35, 60],
  popupAnchor: [0, 0],
});

/**
 * Read-only office location map.
 *
 * Leaflet owns its container node's lifecycle: `Map._initContainer` stamps the
 * node with `_leaflet_id`, and `map.remove()` is the only thing permitted to
 * clear that stamp — it throws `Map container is being reused by another
 * instance` when the stamp changed underneath it. So never touch `_leaflet_id`
 * from React, and never gate `<MapContainer>` behind extra state: react-leaflet
 * already calls `map.remove()` in its own unmount cleanup, and React runs a
 * parent's cleanup *before* its children's, so anything this component does to
 * the node on unmount lands before that call and breaks it.
 */
export default function Map() {
  return (
    <div className="h-full w-full overflow-hidden rounded">
      <MapContainer
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

        <Marker position={DEFAULT_CENTER} draggable={false} icon={MARKER_ICON} />
      </MapContainer>
    </div>
  );
}

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
