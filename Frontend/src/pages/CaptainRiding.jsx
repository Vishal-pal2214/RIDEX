import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import FinishRide from '../component/FinishRide'
import LiveTracking from '../component/LiveTracking'

const CaptainRiding = () => {
  const [ finishRidePanel, setFinishRidePanel ] = useState(false)
  const finishRidePanelRef = useRef(null)
  const location = useLocation()
  const rideData = location.state?.ride

  useGSAP(() => {
    gsap.to(finishRidePanelRef.current, {
      transform: finishRidePanel ? 'translateY(0)' : 'translateY(100%)',
    })
  }, [ finishRidePanel ])

  return (
    <div className='h-screen relative flex flex-col justify-end'>
      <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
        <div className='text-2xl font-black tracking-[0.3em] text-black'>RIDEX</div>
        <Link to='/captain-home' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
          <i className='text-lg font-medium ri-home-5-line'></i>
        </Link>
      </div>
      <div className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10' onClick={() => setFinishRidePanel(true)}>
        <h5 className='p-1 text-center w-[90%] absolute top-0'><i className='text-3xl text-gray-800 ri-arrow-up-wide-line'></i></h5>
        <h4 className='text-xl font-semibold'>Ride in progress</h4>
        <button className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Complete Ride</button>
      </div>
      <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>
      <div className='h-screen fixed w-screen top-0 z-[-1]'>
        <LiveTracking />
      </div>
    </div>
  )
}

export default CaptainRiding
