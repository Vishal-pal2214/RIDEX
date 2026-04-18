import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const CaptainLogout = () => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API_BASE_URL}/captains/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).finally(() => {
      localStorage.removeItem('token')
      navigate('/captain-login')
    })
  }, [ navigate, token ])

  return <div className='p-6'>Signing out...</div>
}

export default CaptainLogout
