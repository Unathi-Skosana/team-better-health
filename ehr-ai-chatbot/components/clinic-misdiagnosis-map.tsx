"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useCallback, useMemo } from "react"
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

interface ClinicData {
  id: string
  name: string
  type: 'clinic' | 'hospital' | 'medical_center'
  longitude: number
  latitude: number
  misdiagnosisRate: number
  totalPatients: number
  misdiagnosedCases: number
  commonMisdiagnoses: string[]
  region: string
  address: string
  phone?: string
}

interface ClinicMisdiagnosisMapProps {
  mapId: string
  title: string
  description?: string
  data?: ClinicData[]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

const FACILITY_TYPES = {
  clinic: { label: "Clinic", icon: "🏥", color: "#3b82f6" },
  hospital: { label: "Hospital", icon: "🏥", color: "#ef4444" },
  medical_center: { label: "Medical Center", icon: "🏥", color: "#22c55e" }
}

// Sample clinic data with realistic misdiagnosis rates
const SAMPLE_CLINIC_DATA: ClinicData[] = [
  {
    id: "1",
    name: "Cape Town General Hospital",
    type: "hospital",
    longitude: 18.4241,
    latitude: -33.9249,
    misdiagnosisRate: 12.3,
    totalPatients: 15420,
    misdiagnosedCases: 1897,
    commonMisdiagnoses: ["Pneumonia", "Heart Attack", "Appendicitis"],
    region: "Western Cape",
    address: "7925 Cape Town, South Africa",
    phone: "+27 21 404 9111"
  },
  {
    id: "2", 
    name: "Johannesburg Medical Center",
    type: "medical_center",
    longitude: 28.0436,
    latitude: -26.2041,
    misdiagnosisRate: 8.7,
    totalPatients: 12850,
    misdiagnosedCases: 1118,
    commonMisdiagnoses: ["Diabetes", "Hypertension", "Cancer"],
    region: "Gauteng",
    address: "123 Medical District, Johannesburg",
    phone: "+27 11 555 0123"
  },
  {
    id: "3",
    name: "Durban Community Clinic",
    type: "clinic", 
    longitude: 31.0292,
    latitude: -29.8587,
    misdiagnosisRate: 15.8,
    totalPatients: 8750,
    misdiagnosedCases: 1383,
    commonMisdiagnoses: ["Malaria", "Tuberculosis", "Pneumonia"],
    region: "KwaZulu-Natal",
    address: "456 Community St, Durban",
    phone: "+27 31 555 0456"
  },
  {
    id: "4",
    name: "Port Elizabeth Hospital",
    type: "hospital",
    longitude: 25.5706,
    latitude: -33.9608,
    misdiagnosisRate: 11.2,
    totalPatients: 9670,
    misdiagnosedCases: 1083,
    commonMisdiagnoses: ["Stroke", "Heart Disease", "Cancer"],
    region: "Eastern Cape", 
    address: "789 Hospital Ave, Port Elizabeth",
    phone: "+27 41 555 0789"
  },
  {
    id: "5",
    name: "Pretoria Medical Clinic",
    type: "clinic",
    longitude: 28.1871,
    latitude: -25.7479,
    misdiagnosisRate: 9.4,
    totalPatients: 5430,
    misdiagnosedCases: 510,
    commonMisdiagnoses: ["Diabetes", "Hypertension", "Respiratory"],
    region: "Gauteng",
    address: "321 Medical Plaza, Pretoria"
  },
  {
    id: "6",
    name: "Bloemfontein Central Hospital",
    type: "hospital",
    longitude: 26.1596,
    latitude: -29.0852,
    misdiagnosisRate: 13.7,
    totalPatients: 11280,
    misdiagnosedCases: 1545,
    commonMisdiagnoses: ["Appendicitis", "Pneumonia", "Stroke"],
    region: "Free State",
    address: "654 Central Blvd, Bloemfontein",
    phone: "+27 51 555 0321"
  },
  {
    id: "7",
    name: "Nelspruit Regional Clinic",
    type: "clinic",
    longitude: 30.9705,
    latitude: -25.4744,
    misdiagnosisRate: 17.2,
    totalPatients: 6920,
    misdiagnosedCases: 1190,
    commonMisdiagnoses: ["Malaria", "Tuberculosis", "HIV/AIDS"],
    region: "Mpumalanga",
    address: "987 Regional Way, Nelspruit"
  },
  {
    id: "8",
    name: "Polokwane Medical Center",
    type: "medical_center",
    longitude: 29.4619,
    latitude: -23.8969,
    misdiagnosisRate: 10.6,
    totalPatients: 8230,
    misdiagnosedCases: 872,
    commonMisdiagnoses: ["Hypertension", "Diabetes", "Heart Disease"],
    region: "Limpopo",
    address: "147 Medical Center Dr, Polokwane",
    phone: "+27 15 555 0654"
  },
  {
    id: "9",
    name: "Kimberley District Hospital",
    type: "hospital",
    longitude: 24.7473,
    latitude: -28.7382,
    misdiagnosisRate: 14.1,
    totalPatients: 7560,
    misdiagnosedCases: 1066,
    commonMisdiagnoses: ["Pneumonia", "Tuberculosis", "Cancer"],
    region: "Northern Cape",
    address: "258 District St, Kimberley"
  },
  {
    id: "10",
    name: "Rustenburg Community Clinic",
    type: "clinic",
    longitude: 27.2431,
    latitude: -25.6500,
    misdiagnosisRate: 16.5,
    totalPatients: 4890,
    misdiagnosedCases: 807,
    commonMisdiagnoses: ["Respiratory", "Malaria", "HIV/AIDS"],
    region: "North West",
    address: "369 Community Ave, Rustenburg"
  }
]

export function ClinicMisdiagnosisMap({
  mapId,
  title,
  description,
  data = SAMPLE_CLINIC_DATA
}: ClinicMisdiagnosisMapProps) {
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("all")
  const [hoveredClinic, setHoveredClinic] = useState<ClinicData | null>(null)
  const [popupInfo, setPopupInfo] = useState<{ clinic: ClinicData; longitude: number; latitude: number } | null>(null)

  // Filter clinics based on selected facility type
  const filteredClinics = useMemo(() => {
    if (selectedFacilityType === "all") return data
    return data.filter(clinic => clinic.type === selectedFacilityType)
  }, [data, selectedFacilityType])

  // Create GeoJSON for clinic pins
  const clinicGeoJson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: filteredClinics.map(clinic => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [clinic.longitude, clinic.latitude]
        },
        properties: {
          ...clinic,
          // Determine pin size based on misdiagnosis rate
          pinSize: clinic.misdiagnosisRate >= 15 ? 1.5 : 
                  clinic.misdiagnosisRate >= 12 ? 1.2 : 
                  clinic.misdiagnosisRate >= 9 ? 1.0 : 0.8,
          // Determine pin color based on misdiagnosis rate
          pinColor: clinic.misdiagnosisRate >= 15 ? "#dc2626" : // Red for high
                   clinic.misdiagnosisRate >= 12 ? "#ea580c" : // Orange for medium-high
                   clinic.misdiagnosisRate >= 9 ? "#d97706" :  // Yellow for medium
                   "#16a34a" // Green for low
        }
      }))
    }
  }, [filteredClinics])

  const onHover = useCallback((event: any) => {
    const feature = event.features?.[0]
    if (feature) {
      setHoveredClinic(feature.properties)
    }
  }, [])

  const onClick = useCallback((event: any) => {
    const feature = event.features?.[0]
    if (feature && feature.properties) {
      console.log("Clicked clinic data:", feature.properties)
      setPopupInfo({
        clinic: feature.properties,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat
      })
    }
  }, [])

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
            <span className="text-lg">🏥</span>
            {title}
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <span>📍</span>
            {filteredClinics.length} Facilities
          </Badge>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Facility Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Facility Type:</span>
            <Select value={selectedFacilityType} onValueChange={setSelectedFacilityType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {Object.entries(FACILITY_TYPES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.icon} {info.label}
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
                zoom: 5.5
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onMouseMove={onHover}
              onClick={onClick}
              interactiveLayerIds={["clinic-pins"]}
            >
              <NavigationControl position="top-left" />
              <ScaleControl position="bottom-left" />
              
              <Source id="clinics" type="geojson" data={clinicGeoJson as any}>
                <Layer
                  id="clinic-pins"
                  type="circle"
                  paint={{
                    "circle-radius": ["*", ["get", "pinSize"], 10],
                    "circle-color": ["get", "pinColor"],
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 3,
                    "circle-opacity": 0.9
                  }}
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
                  <div className="rounded-lg bg-white p-4 shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-600 min-w-[280px]">
                    <div className="space-y-3">
                      <div className="border-gray-200 border-b pb-2 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{FACILITY_TYPES[popupInfo.clinic.type as keyof typeof FACILITY_TYPES]?.icon}</span>
                          <h3 className="font-bold text-gray-900 text-lg dark:text-white">
                            {popupInfo.clinic.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                          {popupInfo.clinic.address || 'Address not available'}
                        </p>
                        {popupInfo.clinic.phone && (
                          <p className="text-gray-600 text-sm dark:text-gray-400">
                            📞 {popupInfo.clinic.phone}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Misdiagnosis Rate:</span>
                          <span className={`font-bold text-lg px-2 py-1 rounded ${
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 15 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 12 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 9 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {(popupInfo.clinic.misdiagnosisRate || 0).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Total Patients:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {popupInfo.clinic.totalPatients?.toLocaleString() || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Misdiagnosed Cases:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {popupInfo.clinic.misdiagnosedCases?.toLocaleString() || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm dark:text-gray-400">Risk Level:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 15 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 12 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                            (popupInfo.clinic.misdiagnosisRate || 0) >= 9 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {(popupInfo.clinic.misdiagnosisRate || 0) >= 15 ? 'High Risk' :
                             (popupInfo.clinic.misdiagnosisRate || 0) >= 12 ? 'Medium-High Risk' :
                             (popupInfo.clinic.misdiagnosisRate || 0) >= 9 ? 'Medium Risk' : 'Low Risk'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-gray-200 border-t dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Common Misdiagnoses:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(popupInfo.clinic.commonMisdiagnoses) ? popupInfo.clinic.commonMisdiagnoses.map((misdiagnosis, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {misdiagnosis}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="text-xs">
                              No data available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium">Misdiagnosis Rate:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>&lt; 9% (Low)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
              <span>9-12% (Medium)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span>12-15% (Medium-High)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>&gt; 15% (High)</span>
            </div>
          </div>

          {/* Hover Info */}
          {hoveredClinic && (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{FACILITY_TYPES[hoveredClinic.type as keyof typeof FACILITY_TYPES]?.icon}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <strong>{hoveredClinic.name}</strong>
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Misdiagnosis Rate: <span className={`font-medium ${
                  (hoveredClinic.misdiagnosisRate || 0) >= 15 ? 'text-red-600 dark:text-red-400' :
                  (hoveredClinic.misdiagnosisRate || 0) >= 12 ? 'text-orange-600 dark:text-orange-400' :
                  (hoveredClinic.misdiagnosisRate || 0) >= 9 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>{(hoveredClinic.misdiagnosisRate || 0).toFixed(1)}%</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {hoveredClinic.totalPatients?.toLocaleString() || 'N/A'} total patients • {hoveredClinic.misdiagnosedCases?.toLocaleString() || 'N/A'} misdiagnosed
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredClinics.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Facilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {(filteredClinics.reduce((sum, clinic) => sum + clinic.misdiagnosisRate, 0) / filteredClinics.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Misdiagnosis Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredClinics.reduce((sum, clinic) => sum + clinic.totalPatients, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {filteredClinics.reduce((sum, clinic) => sum + clinic.misdiagnosedCases, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Misdiagnosed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
