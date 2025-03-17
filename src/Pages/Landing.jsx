import React from 'react';
import Undraw_professor from '../assets/undraw_professor_xcrw.svg'
import Undraw_teaching from '../assets/undraw_teaching.svg'
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="font-sans bg-gray-100">
      {/* Navbar Section */}
      <div className="bg-white shadow-md">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className='flex items-center justify-around bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 w-screen h-screen p-8'>
        <img src={Undraw_professor} alt="Hero" className='w-1/4 h-auto rounded-lg' />
        <div className='w-5/12 bg-white p-8 rounded-lg shadow-lg text-gray-800'>
          <h1 className="text-3xl font-bold mb-4">Welcome to Kora</h1>
          <p className="text-lg">
            Unlock your potential with Koa – your gateway to mastering the skills of tomorrow. Whether you're starting your journey or leveling up, our expertly crafted courses are designed to help you thrive in a fast-changing world.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className='flex items-center justify-around bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-900 w-screen h-screen p-8'>
        <div className='w-5/12 bg-white p-8 rounded-lg shadow-lg text-gray-800'>
          <h2 className="text-3xl font-bold mb-4">Our Features</h2>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="mt-6 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-800 px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-600 transition duration-300">
            Learn More
          </button>
        </div>
        <img src={Undraw_teaching} alt="Features" className='w-1/4 h-auto rounded-lg ' />
      </section>

      {/* Testimonials Section */}
      <section className='flex items-center justify-around bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 w-screen h-screen p-8'>
        <div className="flex space-x-8">
          {[1, 2, 3].map((item, index) => (
            <div key={index} className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg text-gray-800">
              <div className='w-full p-4 mb-4 border-amber-200 border-2 rounded-lg'>
                <p className="text-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <img src={Undraw_professor} alt={`Testimonial ${item}`} className='w-1/2 h-auto rounded-lg shadow-lg' />
            </div>
          ))}
        </div>
      </section>

      <footer className='flex items-center justify-around bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 w-screen h-28 text-white'>
        <p>&copy; Kora. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;