import { FC } from "react";

import { Marker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "../../css/imports/leaflet.css";

type Props = {
  location: [number, number];
  title: string;
};

export const LeafletThumb: FC<Props> = ({ location, title }) => {
  if (!title || location?.length !== 2) return null;
  return (
    <>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={location}
        zoom={12}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={location}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </>
  );
};
