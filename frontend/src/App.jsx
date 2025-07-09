import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AudioRecord from '../Pages/AudioRecord'
import DashBoard from '../Pages/DashBoard'
import Landing from '../Pages/Landing'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Define the routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/DashBoard",
    element: <DashBoard />
  },
  {
    path: "/Recording",
    element: <AudioRecord />
  }
  
])

function App() {
  const [count, setCount] = useState(0)

  return (
    <RouterProvider router={router} />
  )
}

export default App
