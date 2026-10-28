// app/frontend/src/components/CivicMap.jsx
// Interactive OpenStreetMap Geo-tagging Component using Leaflet
import React, { useEffect, useRef, useState } from 'react';

function CivicMap({ issues = [], selectedLocation = null, onLocationSelect = null, isPickerMode = false }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const issuesLayerRef = useRef(null);

  const [geoLocating, setGeoLocating] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');

  // Default coordinate: New Delhi, India
  const defaultCenter = [28.6139, 77.2090];

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(
        selectedLocation?.lat && selectedLocation?.lng
          ? [selectedLocation.lat, selectedLocation.lng]
          : defaultCenter,
        12
      );

      // High-contrast clean OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      issuesLayerRef.current = window.L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Click to geo-tag
      map.on('click', async (e) => {
        if (!onLocationSelect) return;
        const { lat, lng } = e.latlng;
        await setPickerPin(lat, lng, map);
      });
    }

    return () => {
      // Keep map alive or cleanup
    };
  }, []);

  // Update complaint markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !issuesLayerRef.current) return;

    issuesLayerRef.current.clearLayers();

    issues.forEach((issue) => {
      // Use coordinates or mock coordinates near center for display
      const lat = issue.lat || 28.6139 + (Math.sin(issue.id.length * 17) * 0.08);
      const lng = issue.lng || 77.2090 + (Math.cos(issue.id.length * 23) * 0.08);

      const color =
        issue.category === 'Roads & Potholes'
          ? '#ff007a'
          : issue.category === 'Sanitation & Waste'
          ? '#a3ff00'
          : issue.category === 'Water & Sewage'
          ? '#00d2ff'
          : '#ffd600';

      const customIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border: 2px solid black; box-shadow: 2px 2px 0px black; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      const portalUrl = issue.officialPortalUrl || 'https://pgportal.gov.in/';

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #000; min-width: 180px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; background: #000; color: #a3ff00; padding: 2px 4px; display: inline-block; margin-bottom: 4px;">${issue.id}</div>
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px;">${issue.title}</div>
          <div style="color: #444; margin-bottom: 4px;"><strong>Location:</strong> ${issue.location || 'Reported Point'}</div>
          <div style="color: #444; margin-bottom: 6px;"><strong>Status:</strong> ${issue.status}</div>
          <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" style="display: block; background: #000; color: #a3ff00; text-align: center; font-weight: bold; text-decoration: none; padding: 5px; font-size: 11px; text-transform: uppercase; border: 1px solid black;">🌐 Open Official Portal ➔</a>
        </div>
      `;

      window.L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(issuesLayerRef.current);
    });
  }, [issues]);

  const setPickerPin = async (lat, lng, map = mapInstanceRef.current) => {
    if (!window.L || !map) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const pinIcon = window.L.divIcon({
        className: 'picker-pin',
        html: `<div style="background-color: #ff007a; color: white; width: 30px; height: 30px; border: 2px solid black; box-shadow: 3px 3px 0px black; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 50%;">🎯</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      pickerMarkerRef.current = window.L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      pickerMarkerRef.current.on('dragend', async (event) => {
        const position = event.target.getLatLng();
        await reverseGeocode(position.lat, position.lng);
      });
    }

    await reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Reverse geocode via OpenStreetMap Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        const address =
          data.display_name ||
          `${data.address?.suburb || data.address?.road || 'Selected Point'}, ${data.address?.city || 'India'}`;
        setCurrentAddress(address);

        if (onLocationSelect) {
          onLocationSelect({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            address,
          });
        }
      }
    } catch (e) {
      const fallback = `Geo-tag: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setCurrentAddress(fallback);
      if (onLocationSelect) {
        onLocationSelect({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          address: fallback,
        });
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          await setPickerPin(latitude, longitude);
        }
      },
      (err) => {
        setGeoLocating(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not detect GPS location. Please tap directly on the map to pin your location.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full border-2 border-black shadow-[4px_4px_0px_#000000] overflow-hidden bg-white">
      {/* Map Header Action Bar */}
      <div className="bg-black text-white p-2.5 px-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#a3ff00] border border-black"></span>
          <span className="font-bold uppercase text-[#a3ff00]">
            {isPickerMode ? '🎯 Tap Map to Geo-tag Problem' : '🗺️ Civic Grievances Geo-Map'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoLocating}
            className="btn-neo bg-[#a3ff00] hover:bg-[#8ee000] text-black border border-black px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer flex items-center gap-1"
          >
            <span>📍</span>
            <span>{geoLocating ? 'Detecting GPS...' : 'My Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* Selected Address Indicator (in Picker Mode) */}
      {isPickerMode && currentAddress && (
        <div className="bg-yellow-50 border-b-2 border-black p-2 px-3 text-xs font-medium text-black flex items-center gap-2">
          <span className="font-bold uppercase text-[10px] bg-black text-[#a3ff00] px-1.5 py-0.2 shrink-0">
            Selected Pin
          </span>
          <span className="truncate">{currentAddress}</span>
        </div>
      )}

      {/* Leaflet Map Div */}
      <div
        ref={mapContainerRef}
        style={{ height: isPickerMode ? '240px' : '340px', width: '100%', zIndex: 1 }}
      />
    </div>
  );
}

export default CivicMap;
