import React from 'react'
import { Link } from 'react-router-dom'

const Snavbar = () => {
  return (
    <>
    <div className='navbar flex items-center w-[100vw] h-[10%]' >
        <div className='flex h-[95%] w-[10vh] border-amber-600 text-green-300 rounded-full items-center justify-center'>
          {/* kwjfi */}
        <img src="src/assets/red-flowerField-windMill.jpg" alt="Logo" class=" h-[70%] object-contain rounded-full" />
        </div>
        <div>
            1
        </div>
        <div>
            2
        </div>
        <div>
            3
        </div>
        <div>
            4
        </div>
        <div>
            5
        </div>
        <button>
            <Link
              to="/"
              >
              Go to home
            </Link>
          </button>
    </div>
    </>
  )
}

export default Snavbar