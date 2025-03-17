import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Landing from './Pages/Landing.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/Contact.jsx';
import Signup from './Pages/Signup.jsx';
import PurposePage from './Pages/PurposePage.jsx';
import SuccessPage from './Pages/SuccessPage.jsx';
import TestMainPage from './Pages/TestMainPage.jsx';
import TeacherDashboard from './Pages/TeacherDashboard.jsx'; 
import { ClerkProvider } from '@clerk/clerk-react';
import TeacherProfile from './Pages/TeacherProfile';
import Sdashboard from './Pages/Sdashboard';
import StudentPayment from './Pages/StudentPayment';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// App.jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/landing" />, // Redirect to landing page
  },
  {
    path: '/landing',
    element: <Landing />,
  },
  {
    path: '/purpose',
    element: <PurposePage />,
  },
  {
    path: '/successpage',
    element: <SuccessPage />,
  },
  {
    path: '/student-payment', // Add this route
    element: <StudentPayment />, // Your payment page component
  },
  {
    path: '/teacher-dashboard',
    element: <TeacherDashboard />,
  },
  {
    path: '/teacher-profile',
    element: <TeacherProfile />,
  },
  {
    path: '/student-dashboard',
    element: <Sdashboard />,
  },
  {
    path: '/test-main-page', // Add this route
    element: <TestMainPage />,
  },
  // Other routes...
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);