import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { reverseGeocode } from '../api/index.js';

export default function WeatherMap({ lat, lon, dark, onLocationSelect }) {
  const instanceRef  = useRef(null);
  const markerRef    = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const amberIcon = L.divIcon({
      className: 'amber-pin',
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;border:3px solid #ffffff;box-shadow:0 0 14px rgba(245,158,11,0.9);"></div>',
      iconAnchor: [10, 10],
      iconSize: [20, 20],
    });

    markerRef.current = L.marker([lat, lon], { icon: amberIcon }).addTo(map);

    map.on('click', async (e) => {
      const { lat: la, lng: lo } = e.latlng;
      markerRef.current.setLatLng([la, lo]);
      const name = await reverseGeocode(la, lo);
      onLocationSelect(la, lo, name);
    });

    instanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!instanceRef.current) return;
    instanceRef.current.setView([lat, lon], 10);
    markerRef.current?.setLatLng([lat, lon]);
  }, [lat, lon]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.className = dark
      ? 'leaflet-container map-dark'
      : 'leaflet-container map-light';
  }, [dark]);

  return (
    <div
      ref={containerRef}
      data-noswipe="true"
      className={dark ? 'leaflet-container map-dark' : 'leaflet-container map-light'}
      style={{ width: '100%', height: '300px', zIndex: 1 }}
    />
  );
}
