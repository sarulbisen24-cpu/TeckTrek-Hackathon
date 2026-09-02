import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NAGPUR_CENTER, computeAvailability } from '@/data/parkingData';
import type { ParkingLocation } from '@/types';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface NagpurMapProps {
  parkings: ParkingLocation[];
  onMarkerClick?: (parkingId: string) => void;
  onNavigate?: (parkingId: string) => void;
  showUserLocation?: boolean;
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number } | undefined;
}

function coloredIcon(color: 'green' | 'yellow' | 'red' | 'blue'): L.DivIcon {
  const colors = { green: '#16a34a', yellow: '#eab308', red: '#dc2626', blue: '#2563eb' };
  return L.divIcon({
    className: 'custom-parking-marker',
    html: `<div style="background:${colors[color]};width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });
}

export default function NagpurMap({ parkings, onMarkerClick, onNavigate, showUserLocation = false, height = '400px', zoom = 13, center = NAGPUR_CENTER }: NagpurMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const callbacksRef = useRef({ onMarkerClick, onNavigate });
  callbacksRef.current = { onMarkerClick, onNavigate };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [center.lat, center.lng], zoom, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    parkings.forEach((p) => {
      const avail = computeAvailability(p);
      const iconColor = avail.mapStatus === 'available' ? 'green' : avail.mapStatus === 'limited' ? 'yellow' : 'red';
      const statusText = avail.mapStatus === 'available' ? 'Available' : avail.mapStatus === 'limited' ? 'Limited' : 'Full';
      const marker = L.marker([p.lat, p.lng], { icon: coloredIcon(iconColor) }).addTo(map);
      const popupHtml = `
        <div style="min-width:220px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${p.name}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px;">${p.address}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;margin-bottom:4px;">
            <span><b>Total:</b> ${p.totalSpaces}</span>
            <span style="color:#16a34a;"><b>Avail:</b> ${avail.available}</span>
            <span style="color:#dc2626;"><b>Occ:</b> ${avail.occupied}</span>
            <span style="color:#eab308;"><b>Res:</b> ${avail.reserved}</span>
          </div>
          <div style="font-size:12px;margin-bottom:4px;"><b>Price:</b> ₹${p.pricePerHour}/hour · <b>Rating:</b> ⭐ ${p.rating}</div>
          <div style="font-size:12px;margin-bottom:4px;"><b>Hours:</b> ${p.openHours}</div>
          <div style="font-size:12px;color:#888;margin-bottom:8px;"><b>Distance:</b> ${p.distance} km · <b>Status:</b> ${statusText}</div>
          <div style="display:flex;gap:6px;">
            <a href="#/parking/${p.id}" data-parking-id="${p.id}" data-action="view" style="flex:1;background:#2563eb;color:white;text-align:center;padding:6px 0;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;">VIEW PARKING</a>
            <a href="#" data-parking-id="${p.id}" data-action="navigate" style="flex:1;background:#f3f4f6;color:#374151;text-align:center;padding:6px 0;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;">NAVIGATE</a>
          </div>
        </div>`;
      marker.bindPopup(popupHtml);
      if (callbacksRef.current.onMarkerClick) {
        marker.on('click', () => callbacksRef.current.onMarkerClick?.(p.id));
      }
      markersRef.current.push(marker);
    });

    // Handle popup button clicks via event delegation
    map.on('popupopen', (e: L.PopupEvent) => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;
      popupEl.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          const pid = (btn as HTMLElement).dataset.parkingId ?? '';
          const action = (btn as HTMLElement).dataset.action;
          if (action === 'view') callbacksRef.current.onMarkerClick?.(pid);
          else if (action === 'navigate') callbacksRef.current.onNavigate?.(pid);
        });
      });
    });
  }, [parkings]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showUserLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (userMarkerRef.current) userMarkerRef.current.remove();
        userMarkerRef.current = L.marker([latitude, longitude], { icon: coloredIcon('blue') })
          .addTo(map).bindPopup('<div style="font-weight:600;">Your Location</div>');
        map.setView([latitude, longitude], 14);
      },
      () => { /* permission denied — keep Nagpur as demo location */ }
    );
  }, [showUserLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 200);
  }, []);

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }} />;
}
