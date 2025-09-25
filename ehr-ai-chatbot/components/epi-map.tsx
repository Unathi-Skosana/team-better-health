"use client";

import Map, {
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  Popup,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMemo, useState, useCallback } from "react";
import type { EpiFeatureCollection } from "@/ai/artifacts/epi-map";

interface EpiMapProps {
  geojson: EpiFeatureCollection;
  breaks: number[];
  mapboxToken: string;
}

interface HoverInfo {
  x: number;
  y: number;
  feature: any;
}

export function EpiMap({ geojson, breaks, mapboxToken }: EpiMapProps) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

  // Build a color expression based on count breaks with better epidemiological colors
  const fillPaint = useMemo(() => {
    const expr: any[] = [
      "interpolate",
      ["linear"],
      ["get", "count"],
      breaks[0],
      "#f7f7f7", // Very light gray for zero/low counts
      breaks[1],
      "#d9d9d9", // Light gray
      breaks[2],
      "#bdbdbd", // Medium gray
      breaks[3],
      "#969696", // Dark gray
      breaks[4],
      "#636363", // Darker gray
      breaks[5] || breaks[4] + 100,
      "#252525", // Very dark gray for highest counts
    ];
    return {
      "fill-color": expr,
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.9,
        0.7
      ],
    };
  }, [breaks]);

  const linePaint = {
    "line-color": "#ffffff",
    "line-width": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      2,
      ["boolean", ["feature-state", "selected"], false],
      2,
      0.6
    ],
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      ["boolean", ["feature-state", "selected"], false],
      1,
      0.8
    ],
  };

  const highlightPaint = {
    "fill-color": "#ff6b6b",
    "fill-opacity": 0.3,
  };

  // Compute a reasonable initial view (center of all polygons)
  const [lng, lat] = [25.0, -29.0]; // Center on South Africa // Cape Town area center

  const onHover = useCallback((event: any) => {
    const { features, x, y } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature) {
      setHoverInfo({ x, y, feature: hoveredFeature });
    } else {
      setHoverInfo(null);
    }
  }, []);

  const onClick = useCallback((event: any) => {
    const { features } = event;
    const clickedFeature = features && features[0];
    
    if (clickedFeature) {
      setSelectedRegion(clickedFeature);
    } else {
      setSelectedRegion(null);
    }
  }, []);

  const renderTooltip = (info: HoverInfo) => {
    const { feature } = info;
    const properties = feature.properties;
    
    return (
      <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600">
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 text-sm dark:text-white">
            {properties.name}
          </div>
          <div className="text-gray-600 text-xs dark:text-gray-400">
            Cases: <span className="font-medium text-blue-600 dark:text-blue-400">{properties.count.toLocaleString()}</span>
          </div>
          <div className="text-gray-600 text-xs dark:text-gray-400">
            Region ID: {properties.id}
          </div>
        </div>
      </div>
    );
  };

  const renderPopup = (feature: any) => {
    const properties = feature.properties;
    
    // Calculate centroid of the polygon for better popup positioning
    const coordinates = feature.geometry.coordinates[0];
    let lngSum = 0, latSum = 0;
    for (const coord of coordinates) {
      lngSum += coord[0];
      latSum += coord[1];
    }
    const centroidLng = lngSum / coordinates.length;
    const centroidLat = latSum / coordinates.length;
    
    return (
      <div className="rounded-lg bg-white p-4 shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-600 min-w-[200px]">
        <div className="space-y-3">
          <div className="border-gray-200 border-b pb-2 dark:border-gray-600">
            <h3 className="font-bold text-gray-900 text-lg dark:text-white">
              {properties.name}
            </h3>
            <p className="text-gray-600 text-sm dark:text-gray-400">
              Region ID: {properties.id}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm dark:text-gray-400">Total Cases:</span>
              <span className="font-bold text-blue-600 text-lg dark:text-blue-400">
                {properties.count.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm dark:text-gray-400">Risk Level:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                properties.count >= breaks[4] ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                properties.count >= breaks[3] ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                properties.count >= breaks[2] ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              }`}>
                {properties.count >= breaks[4] ? 'High' :
                 properties.count >= breaks[3] ? 'Medium-High' :
                 properties.count >= breaks[2] ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-gray-200 border-t dark:border-gray-600">
            <button
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white text-sm transition-colors hover:bg-blue-700"
              onClick={() => setSelectedRegion(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 relative">
      <Map
        attributionControl={true}
        dragRotate={false}
        initialViewState={{ longitude: lng, latitude: lat, zoom: 5.5 }}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/light-v11"
        interactiveLayerIds={['epi-fill']}
        onMouseMove={onHover}
        onClick={onClick}
        cursor={hoverInfo ? 'pointer' : 'default'}
      >
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-left" />
        
        <Source data={geojson} id="epi" type="geojson">
          <Layer 
            id="epi-fill" 
            paint={fillPaint as any} 
            type="fill"
          />
          <Layer id="epi-outline" paint={linePaint as any} type="line" />
        </Source>

        {/* Highlight layer for selected region */}
        {selectedRegion && (
          <Source 
            data={{
              type: "FeatureCollection",
              features: [selectedRegion]
            }} 
            id="highlight" 
            type="geojson"
          >
            <Layer id="highlight-fill" paint={highlightPaint as any} type="fill" />
            <Layer 
              id="highlight-outline" 
              paint={{
                "line-color": "#ff6b6b",
                "line-width": 3,
                "line-opacity": 1,
              }} 
              type="line" 
            />
          </Source>
        )}

        {/* Click popup */}
        {selectedRegion && (() => {
          // Calculate centroid for popup positioning
          const coordinates = selectedRegion.geometry.coordinates[0];
          let lngSum = 0, latSum = 0;
          for (const coord of coordinates) {
            lngSum += coord[0];
            latSum += coord[1];
          }
          const centroidLng = lngSum / coordinates.length;
          const centroidLat = latSum / coordinates.length;
          
          return (
            <Popup
              longitude={centroidLng}
              latitude={centroidLat}
              anchor="bottom"
              onClose={() => setSelectedRegion(null)}
              closeButton={false}
            >
              {renderPopup(selectedRegion)}
            </Popup>
          );
        })()}
      </Map>

      {/* Hover tooltip */}
      {hoverInfo && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: hoverInfo.x,
            top: hoverInfo.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {renderTooltip(hoverInfo)}
        </div>
      )}


      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600">
        <div className="space-y-2">
          <div className="font-semibold text-gray-900 text-sm dark:text-white">Cases</div>
          <div className="space-y-1">
            {breaks.map((breakValue, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: index === 0 ? '#f7f7f7' :
                                   index === 1 ? '#d9d9d9' :
                                   index === 2 ? '#bdbdbd' :
                                   index === 3 ? '#969696' :
                                   index === 4 ? '#636363' : '#252525'
                  }}
                />
                <span className="text-gray-600 text-xs dark:text-gray-400">
                  {index === 0 ? `0-${breakValue}` :
                   index === breaks.length - 1 ? `${breaks[index-1]}+` :
                   `${breaks[index-1]}-${breakValue}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}