"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useCallback, useMemo } from "react"
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import southAfricaProvinces from "@/lib/south-africa-provinces-real.json"

interface ProvinceData {
  name: string
  code: string
  population: number
  diseaseValue?: number
  diseases: {
    hypertension: number
    diabetes: number
    heart_disease: number
    obesity: number
    tuberculosis: number
  }
}

interface GeoLocationArtifactProps {
  mapId: string
  title: string
  description?: string
  diseaseType?: string
  data?: ProvinceData[]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

const DISEASE_COLORS = {
  hypertension: "#ef4444",
  diabetes: "#f97316", 
  heart_disease: "#eab308",
  obesity: "#22c55e",
  tuberculosis: "#3b82f6"
}

const DISEASE_LABELS = {
  hypertension: "Hypertension",
  diabetes: "Diabetes",
  heart_disease: "Heart Disease", 
  obesity: "Obesity",
  tuberculosis: "Tuberculosis"
}

export function GeoLocationArtifact({
  mapId,
  title,
  description,
  diseaseType = "hypertension",
  data = []
}: GeoLocationArtifactProps) {
  const [selectedDisease, setSelectedDisease] = useState(diseaseType)
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceData | null>(null)
  const [popupInfo, setPopupInfo] = useState<{ province: ProvinceData; longitude: number; latitude: number } | null>(null)

  // Load South African provinces data
  const provincesData = useMemo(() => {
    if (data.length > 0) return data
    
    // Fallback data if none provided
    return [
      {
        name: "Western Cape",
        code: "WC", 
        population: 7020000,
        diseases: { hypertension: 28.5, diabetes: 12.3, heart_disease: 8.7, obesity: 35.2, tuberculosis: 4.1 }
      },
      {
        name: "Eastern Cape", 
        code: "EC",
        population: 6650000,
        diseases: { hypertension: 32.1, diabetes: 15.8, heart_disease: 12.3, obesity: 42.1, tuberculosis: 6.8 }
      },
      {
        name: "KwaZulu-Natal",
        code: "KZN", 
        population: 11400000,
        diseases: { hypertension: 35.7, diabetes: 18.2, heart_disease: 14.1, obesity: 45.3, tuberculosis: 8.9 }
      },
      {
        name: "Gauteng",
        code: "GP",
        population: 15700000, 
        diseases: { hypertension: 26.4, diabetes: 10.7, heart_disease: 7.2, obesity: 32.1, tuberculosis: 3.8 }
      }
    ]
  }, [data])

  // Create GeoJSON with disease data using real South African provinces
  const geoJsonData = useMemo((): any => {
    console.log("Creating GeoJSON with provinces data:", provincesData)
    console.log("Selected disease:", selectedDisease)
    
    return {
      type: "FeatureCollection" as const,
      features: southAfricaProvinces.features.map((feature) => {
        const provinceName = feature.properties.name
        const provinceData = provincesData.find(p => p.name === provinceName)
        
        console.log(`Processing ${provinceName}:`, provinceData)
        
        if (!provinceData) {
          // Fallback for provinces not in our disease data
          return {
            ...feature,
            type: "Feature" as const,
            properties: {
              ...feature.properties,
              diseaseValue: 0,
              fillColor: "#e0f2fe",
              population: 0,
              diseases: {
                hypertension: 0,
                diabetes: 0,
                heart_disease: 0,
                obesity: 0,
                tuberculosis: 0
              }
            }
          }
        }
        
        const diseaseValue = provinceData.diseases[selectedDisease as keyof typeof provinceData.diseases]
        console.log(`${provinceName} ${selectedDisease}:`, diseaseValue)
        
        return {
          ...feature,
          type: "Feature" as const,
          properties: {
            ...feature.properties,
            ...provinceData,
            diseaseValue: diseaseValue,
            fillColor: DISEASE_COLORS[selectedDisease as keyof typeof DISEASE_COLORS]
          }
        }
      })
    }
    
    console.log("Final GeoJSON data:", geoJsonData)
    return geoJsonData
  }, [provincesData, selectedDisease])

  const onHover = useCallback((event: any) => {
    const feature = event.features?.[0]
    if (feature) {
      setHoveredProvince(feature.properties)
    }
  }, [])

  const onClick = useCallback((event: any) => {
    const feature = event.features?.[0]
    console.log("Clicked feature:", feature)
    if (feature) {
      console.log("Feature properties:", feature.properties)
      setPopupInfo({
        province: feature.properties,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat
      })
    }
  }, [])

  const fillPaint = {
    "fill-color": [
      "interpolate",
      ["linear"],
      ["get", "diseaseValue"],
      0, "#f0fdf4",   // Very light green for low prevalence
      10, "#dcfce7",  // Light green
      20, "#bbf7d0",  // Medium green
      30, "#fef3c7",  // Light yellow
      40, "#fde68a",  // Yellow
      50, "#f59e0b"   // Orange for high prevalence
    ] as any,
    "fill-opacity": 0.8
  }

  const strokePaint = {
    "line-color": "#374151",
    "line-width": 1,
    "line-opacity": 0.9
  }

  if (!MAPBOX_TOKEN) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <span className="text-lg">⚠️</span>
            Map Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">
            Please configure NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.
            <br />
            Get your free token at <a href="https://mapbox.com" className="underline">mapbox.com</a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            {title}
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <span>📍</span>
            South Africa
          </Badge>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Disease Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Disease Type:</span>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISEASE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map Container */}
          <div className="h-[500px] w-full rounded-lg overflow-hidden border">
            <Map
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: 25.0,
                latitude: -29.0,
                zoom: 5
              }}
              style={{ width: "100%", height: "100%" }}
              onMouseMove={onHover}
              onClick={onClick}
              interactiveLayerIds={["data-fill"]}
            >
              <NavigationControl position="top-left" />
              <ScaleControl position="bottom-left" />
              
              <Source id="data" type="geojson" data={geoJsonData as any}>
                <Layer
                  id="data-fill"
                  type="fill"
                  paint={fillPaint}
                />
                <Layer
                  id="data-stroke"
                  type="line"
                  paint={strokePaint}
                />
              </Source>

              {/* Popup */}
              {popupInfo && (
                <Popup
                  longitude={popupInfo.longitude}
                  latitude={popupInfo.latitude}
                  onClose={() => setPopupInfo(null)}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="bottom"
                >
                  <div className="rounded-lg bg-white p-4 shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-600 min-w-[250px]">
                    <div className="space-y-3">
                      <div className="border-gray-200 border-b pb-2 dark:border-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg dark:text-white">
                          {popupInfo.province.name}
                        </h3>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                          Population: {popupInfo.province.population?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Current Disease:</span>
                          <span className="font-bold text-blue-600 text-lg dark:text-blue-400">
                            {DISEASE_LABELS[selectedDisease as keyof typeof DISEASE_LABELS]}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Prevalence:</span>
                          <span className="font-bold text-blue-600 text-lg dark:text-blue-400">
                            {(popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Risk Level:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 40 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            (popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 30 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                            (popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {(popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 40 ? 'High' :
                             (popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 30 ? 'Medium-High' :
                             (popupInfo.province.diseaseValue || popupInfo.province.diseases?.[selectedDisease as keyof typeof popupInfo.province.diseases] || 0) >= 20 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-gray-200 border-t dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          All Disease Rates:
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                          <div className="flex justify-between">
                            <span>Hypertension:</span>
                            <span className="font-medium">{popupInfo.province.diseases?.hypertension || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Diabetes:</span>
                            <span className="font-medium">{popupInfo.province.diseases?.diabetes || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Heart Disease:</span>
                            <span className="font-medium">{popupInfo.province.diseases?.heart_disease || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Obesity:</span>
                            <span className="font-medium">{popupInfo.province.diseases?.obesity || 0}%</span>
                          </div>
                          <div className="flex justify-between col-span-2">
                            <span>Tuberculosis:</span>
                            <span className="font-medium">{popupInfo.province.diseases?.tuberculosis || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Prevalence:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{backgroundColor: "#f0fdf4"}}></div>
              <span>0-10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{backgroundColor: "#dcfce7"}}></div>
              <span>10-20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{backgroundColor: "#bbf7d0"}}></div>
              <span>20-30%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{backgroundColor: "#fef3c7"}}></div>
              <span>30-40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{backgroundColor: "#fde68a"}}></div>
              <span>40-50%</span>
            </div>
          </div>

          {/* Hover Info */}
          {hoveredProvince && (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
              <p className="text-sm text-gray-900 dark:text-white">
                <strong>{hoveredProvince.name}</strong>: {(hoveredProvince.diseaseValue || hoveredProvince.diseases?.[selectedDisease as keyof typeof hoveredProvince.diseases] || 0).toFixed(1)}% {DISEASE_LABELS[selectedDisease as keyof typeof DISEASE_LABELS]}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Population: {hoveredProvince.population?.toLocaleString() || 'N/A'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
