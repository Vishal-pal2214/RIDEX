import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'
import { API_BASE_URL } from '../config/api'

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        setUser(response.data.user)
        setIsLoading(false)
      }
    }).catch(() => {
      localStorage.removeItem('token')
      navigate('/login')
    })
  }, [ navigate, setUser, token ])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default UserProtectWrapper
