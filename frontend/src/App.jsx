import { useState } from 'react';
import './App.css';
import AudioRecord from './Pages/AudioRecord';
import DashBoard from './Pages/DashBoard';
import Landing from './Pages/Landing';
import NotFound from './Pages/NotFound';
import InsertCallRecord from './Pages/InsertCallRecord';

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
    path: '/InsertCallRecord',
    element: < InsertCallRecord />


  },
  {
    path: '/*',
    element: <NotFound />
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
