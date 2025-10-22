"use client";

import React, { JSX, useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  name: string;
  count: number;
  percentage: number;
  coordinates: [number, number];
  flag: JSX.Element;
}

interface MapViewProps {
  locations: Location[];
}

export default function MapView({ locations }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Leaflet only on client side
    const initializeMap = async () => {
      const L = await import('leaflet');
      
      // Fix for default marker icon
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    };

    initializeMap();
  }, []);

  // Don't render map on server side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[9.0820, 8.6753]} // Center of Nigeria
      zoom={3}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      scrollWheelZoom={false}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <CircleMarker
          key={location.id}
          center={location.coordinates}
          radius={Math.max(10, location.percentage / 2)}
          fillColor="#42AA59"
          color="#42AA59"
          weight={2}
          opacity={0.8}
          fillOpacity={0.6}
        >
          <Popup>
            <div className="p-2">
              <div className="font-semibold">{location.name}</div>
              <div className="text-sm text-gray-600">
                {location.count} customers • {location.percentage}%
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}