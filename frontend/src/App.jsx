import { useState } from 'react';
import './App.css';
import AudioRecord from './Pages/AudioRecord';
import DashBoard from './Pages/DashBoard';
import Landing from './Pages/Landing';
import NotFound from './Pages/NotFound';
import InsertCallRecord from './Pages/InsertCallRecord';
import CallDetails from './Pages/CallDetails';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Define the routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/DashBoard',
    element: <DashBoard />
  },
  {
    path: '/Recording',
    element: <AudioRecord />
  },
  {
    path: '/Insert-Call',
    element: < InsertCallRecord />


  },
  {
    path: '/*',
    element: <NotFound />
  }
  ,
  {

    path: '/details',
    element: <CallDetails />
  }
  ,

  {
    path: '/insert',
    element: <InsertCallRecord />
  }
]);

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="main-content">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
