import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Get token from .env (VITE_MAPBOX_TOKEN)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; 

const MapPicker = ({ lat, lng, onChange }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const [zoom, setZoom] = useState(12);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng || 113.4312, lat || -7.0428], // Default to Palengaan Daja, Pamekasan
            zoom: zoom
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create marker
        marker.current = new mapboxgl.Marker({
            draggable: true,
            color: '#6366f1'
        })
        .setLngLat([lng || 113.4312, lat || -7.0428])
        .addTo(map.current);

        marker.current.on('dragend', () => {
            const lngLat = marker.current.getLngLat();
            onChange(lngLat.lat, lngLat.lng);
        });

        map.current.on('click', (e) => {
            marker.current.setLngLat(e.lngLat);
            onChange(e.lngLat.lat, e.lngLat.lng);
        });

    }, []);

    useEffect(() => {
        if (marker.current && lat && lng) {
            marker.current.setLngLat([lng, lat]);
            map.current.flyTo({ center: [lng, lat] });
        }
    }, [lat, lng]);

    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Point Location (Mapbox)
            </label>
            <div ref={mapContainer} className="h-64 w-full rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900" />
            <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                <span>LAT: {lat ? Number(lat).toFixed(6) : 'Not set'}</span>
                <span>LNG: {lng ? Number(lng).toFixed(6) : 'Not set'}</span>
            </div>
            <p className="text-[10px] text-amber-500 italic">Note: Drag the marker or click on map to set location.</p>
        </div>
    );
};

export default MapPicker;
