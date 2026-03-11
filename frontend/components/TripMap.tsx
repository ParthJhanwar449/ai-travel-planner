"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import * as L from "leaflet";

interface Activity {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    cost: number;
}

interface Hotel {
    name: string;
    latitude: number;
    longitude: number;
}

interface TripMapProps {
    itinerary: {
        [day: string]: Activity[];
    };
    hotel?: Hotel;
}

export default function TripMap({ itinerary, hotel }: TripMapProps) {
    const activities = Object.values(itinerary).flat();
    if (!activities || activities.length === 0) return null;

    // Sort days to ensure consistency
    const sortedDays = Object.entries(itinerary).sort(
        ([a], [b]) => Number(a) - Number(b)
    );

    // Day colors for route lines
    const dayColors = [
        "#10b981", // Emerald
        "#3b82f6", // Blue
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#8b5cf6", // Violet
        "#ec4899", // Pink
    ];

    // Type casting to 'any' to bypass strict React 19 / React-Leaflet 5 type conflicts
    const MapContainerAny = MapContainer as any;
    const MarkerAny = Marker as any;
    const PolylineAny = Polyline as any;

    const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const hotelIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const centerPos: [number, number] = hotel
        ? [hotel.latitude, hotel.longitude]
        : activities.length > 0 ? [activities[0].latitude, activities[0].longitude] : [0, 0];

    return (
        <div className="h-96 w-full rounded-xl overflow-hidden mb-8 border border-white/10 shadow-inner">
            <MapContainerAny
                center={centerPos}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route Lines */}
                {sortedDays.map(([day, dayActivities], index) => {
                    const color = dayColors[index % dayColors.length];
                    const points: [number, number][] = dayActivities.map((a) => [
                        a.latitude,
                        a.longitude,
                    ]);

                    // Connect hotel to first activity of Day 1
                    const pathWithHotel = (index === 0 && hotel)
                        ? [[hotel.latitude, hotel.longitude] as [number, number], ...points]
                        : points;

                    return (
                        <PolylineAny
                            key={`path-day-${day}`}
                            positions={pathWithHotel}
                            pathOptions={{
                                color,
                                weight: 4,
                                opacity: 0.6,
                                dashArray: index === 0 && hotel ? "10, 10" : undefined
                            }}
                        />
                    );
                })}

                {hotel && (
                    <MarkerAny
                        position={[hotel.latitude, hotel.longitude]}
                        icon={hotelIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[120px]">
                                <strong className="text-amber-600 block border-b border-amber-100 pb-1 mb-1 uppercase text-xs font-black">
                                    🏨 Lodging
                                </strong>
                                <span className="text-gray-900 font-bold block">
                                    {hotel.name}
                                </span>
                            </div>
                        </Popup>
                    </MarkerAny>
                )}

                {activities.map((activity) => (
                    <MarkerAny
                        key={activity.id}
                        position={[activity.latitude, activity.longitude]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[120px]">
                                <strong className="text-emerald-600 block border-b border-emerald-100 pb-1 mb-1 uppercase text-xs font-black">
                                    📍 Activity
                                </strong>
                                <span className="text-gray-900 font-bold block mb-1">
                                    {activity.name}
                                </span>
                                <span className="text-blue-600 font-bold block text-sm">
                                    Cost: €{activity.cost}
                                </span>
                            </div>
                        </Popup>
                    </MarkerAny>
                ))}
            </MapContainerAny>
        </div>
    );
}