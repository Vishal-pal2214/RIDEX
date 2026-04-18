import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../component/LocationSearchPanel'
import VehiclePanel from '../component/VehiclePanel'
import ConfirmRide from '../component/ConfirmRide'
import LookingForDriver from '../component/LookingForDriver'
import WaitingForDriver from '../component/WaitingForDriver'
import LiveTracking from '../component/LiveTracking'
import { SocketContext } from '../context/SocketContext'
import { UserDataContext } from '../context/UserContext'
import { API_BASE_URL } from '../config/api'

const Home = () => {
  const [ pickup, setPickup ] = useState('')
  const [ destination, setDestination ] = useState('')
  const [ panelOpen, setPanelOpen ] = useState(false)
  const [ vehiclePanel, setVehiclePanel ] = useState(false)
  const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
  const [ vehicleFound, setVehicleFound ] = useState(false)
  const [ waitingForDriver, setWaitingForDriver ] = useState(false)
  const [ pickupSuggestions, setPickupSuggestions ] = useState([])
  const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
  const [ activeField, setActiveField ] = useState(null)
  const [ fare, setFare ] = useState({})
  const [ vehicleType, setVehicleType ] = useState(null)
  const [ ride, setRide ] = useState(null)

  const vehiclePanelRef = useRef(null)
  const confirmRidePanelRef = useRef(null)
  const vehicleFoundRef = useRef(null)
  const waitingForDriverRef = useRef(null)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)

  const navigate = useNavigate()
  const { socket } = useContext(SocketContext)
  const { user } = useContext(UserDataContext)

  useEffect(() => {
    if (!socket || !user?._id) {
      return undefined
    }

    socket.emit('join', { userType: 'user', userId: user._id })

    const handleRideConfirmed = (nextRide) => {
      setVehicleFound(false)
      setWaitingForDriver(true)
      setRide(nextRide)
    }

    const handleRideStarted = (nextRide) => {
      setWaitingForDriver(false)
      navigate('/riding', { state: { ride: nextRide } })
    }

    socket.on('ride-confirmed', handleRideConfirmed)
    socket.on('ride-started', handleRideStarted)

    return () => {
      socket.off('ride-confirmed', handleRideConfirmed)
      socket.off('ride-started', handleRideStarted)
    }
  }, [ navigate, socket, user?._id ])

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }

  const handlePickupChange = async (e) => {
    const value = e.target.value
    setPickup(value)

    if (value.trim().length < 3) {
      setPickupSuggestions([])
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/maps/get-suggestions`, {
        params: { input: value },
        headers: authHeaders,
      })
      setPickupSuggestions(response.data)
    } catch (error) {
      console.error('Failed to load pickup suggestions', error)
    }
  }

  const handleDestinationChange = async (e) => {
    const value = e.target.value
    setDestination(value)

    if (value.trim().length < 3) {
      setDestinationSuggestions([])
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/maps/get-suggestions`, {
        params: { input: value },
        headers: authHeaders,
      })
      setDestinationSuggestions(response.data)
    } catch (error) {
      console.error('Failed to load destination suggestions', error)
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
  }

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, { height: '70%', padding: 24 })
      gsap.to(panelCloseRef.current, { opacity: 1 })
    } else {
      gsap.to(panelRef.current, { height: '0%', padding: 0 })
      gsap.to(panelCloseRef.current, { opacity: 0 })
    }
  }, [ panelOpen ])

  useGSAP(() => {
    gsap.to(vehiclePanelRef.current, {
      transform: vehiclePanel ? 'translateY(0)' : 'translateY(100%)',
    })
  }, [ vehiclePanel ])

  useGSAP(() => {
    gsap.to(confirmRidePanelRef.current, {
      transform: confirmRidePanel ? 'translateY(0)' : 'translateY(100%)',
    })
  }, [ confirmRidePanel ])

  useGSAP(() => {
    gsap.to(vehicleFoundRef.current, {
      transform: vehicleFound ? 'translateY(0)' : 'translateY(100%)',
    })
  }, [ vehicleFound ])

  useGSAP(() => {
    gsap.to(waitingForDriverRef.current, {
      transform: waitingForDriver ? 'translateY(0)' : 'translateY(100%)',
    })
  }, [ waitingForDriver ])

  async function findTrip() {
    const response = await axios.get(`${API_BASE_URL}/rides/get-fare`, {
      params: { pickup, destination },
      headers: authHeaders,
    })

    setFare(response.data)
    setVehiclePanel(true)
    setPanelOpen(false)
  }

  async function createRide() {
    await axios.post(`${API_BASE_URL}/rides/create`, {
      pickup,
      destination,
      vehicleType,
    }, {
      headers: authHeaders,
    })
  }

  return (
    <div className='h-screen relative overflow-hidden'>
      <img className='w-16 absolute left-5 top-5 z-10' src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='' />
      <div className='h-screen w-screen'>
        <LiveTracking />
      </div>
      <div className='flex flex-col justify-end h-screen absolute top-0 w-full'>
        <div className='h-[30%] p-6 bg-white relative'>
          <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl'>
            <i className='ri-arrow-down-wide-line'></i>
          </h5>
          <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form className='relative py-3' onSubmit={submitHandler}>
            <div className='line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full'></div>
            <input onClick={() => { setPanelOpen(true); setActiveField('pickup') }} value={pickup} onChange={handlePickupChange} className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full' type='text' placeholder='Add a pick-up location' />
            <input onClick={() => { setPanelOpen(true); setActiveField('destination') }} value={destination} onChange={handleDestinationChange} className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' type='text' placeholder='Enter your destination' />
          </form>
          <button onClick={findTrip} className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>Find Trip</button>
        </div>
        <div ref={panelRef} className='bg-white h-0 overflow-hidden'>
          <LocationSearchPanel suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions} setPickup={setPickup} setDestination={setDestination} activeField={activeField} />
        </div>
      </div>
      <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
        <VehiclePanel selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
      </div>
      <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
        <ConfirmRide createRide={createRide} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType} setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
      </div>
      <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
        <LookingForDriver createRide={createRide} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType} setVehicleFound={setVehicleFound} />
      </div>
      <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12'>
        <WaitingForDriver ride={ride} setVehicleFound={setVehicleFound} setWaitingForDriver={setWaitingForDriver} waitingForDriver={waitingForDriver} />
      </div>
    </div>
  )
}

export default Home
