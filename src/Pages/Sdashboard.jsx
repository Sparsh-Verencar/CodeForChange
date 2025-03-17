import React, { useState, useEffect, useRef } from 'react';
import Snavbar from './Snavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sdashboard = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [ongoingCourses, setOngoingCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchContainerRef = useRef(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const paymentSuccess = localStorage.getItem('paymentSuccess');
        if (paymentSuccess) {
          const { message } = JSON.parse(paymentSuccess);
          setSuccessMessage(message);
          localStorage.removeItem('paymentSuccess');
          
          // Clear message after 5 seconds
          const timer = setTimeout(() => setSuccessMessage(null), 5000);
          return () => clearTimeout(timer);
        }
      }, []);
      
      // Add this message display in your return statement
      {successMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white p-4 rounded-lg z-50">
          {successMessage}
        </div>
      )}

    useEffect(() => {
        const pendingCourse = localStorage.getItem('pendingCourse');
        if (pendingCourse && !ongoingCourses.includes(pendingCourse)) {
            setOngoingCourses(prev => [...prev, pendingCourse]);
            localStorage.removeItem('pendingCourse');
        }
    }, [ongoingCourses]);
    // Fetch published cards on component mount
    useEffect(() => {
        const fetchPublishedCards = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/get-published-cards');
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data.map(course => ({
                        ...course,
                        photo: course?.photo?.startsWith('http') 
                            ? course.photo 
                            : `http://localhost:5000${course?.photo || ''}`,
                        cardPhoto: course?.cardPhoto?.startsWith('http')
                            ? course.cardPhoto
                            : `http://localhost:5000${course?.cardPhoto || ''}`
                    })));
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPublishedCards();
    }, []);

    const handleCardClick = (course) => {
        if (ongoingCourses.includes(course.courseName)) return;
        
        localStorage.setItem('pendingCourse', course.courseName);
        
        // Include additional parameters
        const stripeUrl = new URL("https://buy.stripe.com/test_00g6pf9UO0gs4vK288");
        stripeUrl.searchParams.append('course', course.courseName);
        stripeUrl.searchParams.append('teacher', course.name);
        
        window.location.href = stripeUrl.toString();
      };

    // Filtering uses `query` so filtering happens only on Enter
    const filteredCourses = courses.filter(course =>
        course?.courseName?.toLowerCase().includes(query.toLowerCase())
    );

    // Determine which courses to display based on activeTab:
    let displayedCourses;
    if (activeTab === "ongoing") {
        displayedCourses = courses.filter(course =>
            ongoingCourses.includes(course.courseName) &&
            course?.courseName?.toLowerCase().includes(query.toLowerCase())
        );
    } else if (activeTab === "completed") {
        displayedCourses = [];
    } else {
        displayedCourses = filteredCourses;
    }

    // When a course card is clicked, mark it as ongoing (if not already)
    const markAsOngoing = (courseTitle) => {
        if (!ongoingCourses.includes(courseTitle)) {
            setOngoingCourses([...ongoingCourses, courseTitle]);
        }
    };

    // Handle key press event in the search bar:
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setQuery(search);
        }
    };

    // When the Home button is pressed, reset to show all courses.
    const handleHomeClick = () => {
        setActiveTab("all");
        setSearch("");
        setQuery("");
    };
    const formatImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `http://localhost:5000${url}`;
    };
    const CourseCard = ({ course }) => {
        const navigate = useNavigate();
      
        const handleClick = () => {
          // Redirect to the payment page with course details
          navigate('/student-payment', {
            state: { course }, // Pass course data as state
          });
        };
      
        return (
          <div 
            className="bg-white p-4 rounded-lg shadow-md relative h-64 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleClick} // Add click handler
          >
            {/* Card Background */}
            <div 
              className="absolute inset-0 rounded-lg bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${formatImageUrl(course.cardPhoto)})` }}
            >
              <div className="absolute inset-0 bg-black/30 rounded-lg" />
            </div>
      
            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Section */}
              <div className="flex justify-between items-start">
                {/* Left - Profile + Course Name + Subject + Duration */}
                <div className="bg-black/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={formatImageUrl(course.photo)}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-white"
                      onError={(e) => {
                        e.target.src = '/default-profile.png';
                      }}
                    />
                    <h2 className="text-white font-bold text-xl">{course.courseName}</h2>
                  </div>
                  <div className="text-white">
                    <p><span className="font-semibold">Subject:</span> {course.subject}</p>
                    <p><span className="font-semibold">Duration:</span> {course.courseLength}</p>
                  </div>
                </div>
      
                {/* Right - Teacher Name + Specialization */}
                <div className="bg-black/50 p-3 rounded-lg max-w-[60%]">
                  <h3 className="text-white font-bold text-lg">{course.name}</h3>
                  <p className="text-teal-200 text-sm mt-1">{course.specialization}</p>
                </div>
              </div>
            </div>
          </div>
        );
      };
    return (
        <div className='w-full h-screen overflow-x-hidden flex flex-col'>
            <Snavbar />

            {/* Mobile Hamburger Menu at Top */}
            <div className="md:hidden p-1 bg-teal-600 text-white flex items-center">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="ml-2 text-lg font-bold">Menu</span>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-14 left-0 h-full w-[70vw] bg-teal-600 p-1 z-50"
                    >
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="border-t border-teal-700 my-1"></div>
                        <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => { setActiveTab("ongoing"); setMobileMenuOpen(false); }}>
                            Ongoing
                        </button>
                        <div className="border-t border-teal-700 my-1"></div>
                        <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => { setActiveTab("completed"); setMobileMenuOpen(false); }}>
                            Completed
                        </button>
                        <div className="border-t border-teal-700 my-1"></div>
                        <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => { setActiveTab("all"); setMobileMenuOpen(false); }}>
                            All Courses
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Row */}
            <div className='flex flex-1'>
                {/* Desktop Sidebar */}
                <div className='hidden md:flex w-[20vw] bg-teal-600 flex-col p-1 gap-1'>
                    <button className='text-4xl py-1 font-extrabold' onClick={handleHomeClick}>Home</button>
                    <div className="relative">
                        <button className="text-white py-1 text-2xl font-bold" onClick={() => setIsOpen(!isOpen)}>
                            My Courses
                        </button>
                        <div className='border border-teal-800 mt-1'></div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="left-0 mt-1 bg-teal-500 shadow rounded p-1"
                                >
                                    <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => setActiveTab("ongoing")}>
                                        Ongoing
                                    </button>
                                    <div className="border-t border-teal-700 my-1"></div>
                                    <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => setActiveTab("completed")}>
                                        Completed
                                    </button>
                                    <div className="border-t border-teal-700 my-1"></div>
                                    <button className="block w-full text-left px-3 py-1 text-white text-sm md:text-base" onClick={() => setActiveTab("all")}>
                                        All Courses
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className='text-2xl py-1 text-white font-bold'>Section 2</div>
                </div>

                {/* Right Box */}
                <div className="w-full md:w-[80vw] flex flex-col bg-teal-800 p-1 grow">
                    {/* Search Bar */}
                    <div id="search-bar" ref={searchContainerRef} className="relative mb-1">
                        <input 
                            type="text" 
                            placeholder="Search courses..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            className="p-1 border rounded w-full bg-teal-600 text-black text-sm md:text-base"
                        />
                    </div>

                    {/* Cards Section */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4`}>
            {displayedCourses.map((course, index) => (
                <CourseCard key={index} course={course} />
            ))}
        </div>
                </div>
            </div>
        </div>
    );
};

export default Sdashboard;