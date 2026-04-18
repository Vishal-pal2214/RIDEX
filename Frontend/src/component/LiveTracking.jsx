import React, { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const center = {
  lat: 28.6139,
  lng: 77.209,
}

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const LiveTracking = () => {
  const [ currentPosition, setCurrentPosition ] = useState(center)

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      })
    })

    const watchId = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      })
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  if (!mapsApiKey) {
    return (
      <div className='h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm px-6 text-center'>
        Add `VITE_GOOGLE_MAPS_API_KEY` in your frontend env file to enable live maps.
      </div>
    )
  }

  return (
    <LoadScript googleMapsApiKey={mapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={15}
      >
        <Marker position={currentPosition} />
      </GoogleMap>
    </LoadScript>
  )
}

export default LiveTracking
