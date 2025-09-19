"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LeafletMapProps {
  latitude: number
  longitude: number
  accuracy?: number
  zoom?: number
  height?: string
  className?: string
  showAccuracyCircle?: boolean
  onLocationUpdate?: (lat: number, lng: number) => void
}

export default function LeafletMap({
  latitude,
  longitude,
  accuracy = 10,
  zoom = 15,
  height = '300px',
  className = '',
  showAccuracyCircle = true,
  onLocationUpdate
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const accuracyCircleRef = useRef<L.Circle | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    // Add click handler for location updates
    if (onLocationUpdate) {
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng
        onLocationUpdate(lat, lng)
      })
    }

    // Cleanup function for unmount only
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        accuracyCircleRef.current = null
      }
    }
  }, []) // Empty dependency array - initialize once

  // Update marker and location separately
  useEffect(() => {
    if (!mapRef.current) return

    const newLatLng = L.latLng(latitude, longitude)
    
    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(newLatLng)
      markerRef.current.getPopup()?.setContent(`
        <div>
          <strong>Current Location</strong><br/>
          Lat: ${latitude.toFixed(6)}<br/>
          Lng: ${longitude.toFixed(6)}<br/>
          Accuracy: ±${accuracy}m
        </div>
      `)
    } else {
      markerRef.current = L.marker(newLatLng, {
        title: 'Current Location',
        alt: 'Your current location'
      }).addTo(mapRef.current)
      markerRef.current.bindPopup(`
        <div>
          <strong>Current Location</strong><br/>
          Lat: ${latitude.toFixed(6)}<br/>
          Lng: ${longitude.toFixed(6)}<br/>
          Accuracy: ±${accuracy}m
        </div>
      `)
    }

    // Update or create accuracy circle
    if (showAccuracyCircle) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(newLatLng).setRadius(accuracy)
      } else {
        accuracyCircleRef.current = L.circle(newLatLng, {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(mapRef.current)
      }
    } else if (accuracyCircleRef.current) {
      mapRef.current.removeLayer(accuracyCircleRef.current)
      accuracyCircleRef.current = null
    }

    // Center map on location
    mapRef.current.setView(newLatLng, zoom)
  }, [latitude, longitude, accuracy, zoom, showAccuracyCircle])

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-lg border border-border/20 ${className}`}
      style={{ height }}
    />
  )
}