import React from 'react'
import { Link } from 'react-router-dom'
const About = () => {
  return (
    <div>
      About
      <button>
        <Link
          to="/"
        >
          Go to home
        </Link>
      </button>
    </div>
  )
}

export default About
