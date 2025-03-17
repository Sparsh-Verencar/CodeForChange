import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const StudentPayment = () => {
  const location = useLocation();
  const { course } = location.state || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialMaterials, setTrialMaterials] = useState([]); // State to hold fetched trial materials

  const handleTrialClick = async () => {
    if (!course || !course.courseName) {
      alert('No course selected. Please go back and select a course.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/get-trial-materials/${course.courseName}`);
      if (!response.ok) throw new Error('Failed to fetch trial materials');

      const fetchedTrialMaterials = await response.json(); // Fetch materials
      if (!fetchedTrialMaterials || fetchedTrialMaterials.length === 0) {
        alert('No trial materials available for this course. Please contact support.');
        return;
      }

      setTrialMaterials(fetchedTrialMaterials); // Set state with fetched materials
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trial materials:', error);
      alert('Failed to fetch trial materials. Please try again later.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Course Payment</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={course.photo}
            alt="Teacher Profile"
            className="w-16 h-16 rounded-full border-2 border-gray-200"
            onError={(e) => {
              e.target.src = '/default-profile.png'; // Placeholder for missing images
            }}
          />
          <div>
            <h2 className="text-xl font-semibold">{course.name}</h2>
            <p className="text-gray-600">{course.specialization}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold mb-2">
            You are opting for the course: <span className="text-blue-600">{course.courseName}</span>
          </p>
          <p><strong>Subject:</strong> {course.subject}</p>
          <p><strong>Duration:</strong> {course.courseLength}</p>
        </div>

        <div className="flex gap-4">
          {/* Payment Button */}
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            // Implement payment functionality here
          >
            Payment
          </button>

          {/* Trial Button */}
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleTrialClick} // Open the modal on click
          >
            Trial
          </button>
        </div>
      </div>

      {/* Modal for Trial Materials */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Trial Materials</h2>
            <div className="flex flex-col gap-2">
              {trialMaterials.length > 0 ? ( // Check if trialMaterials has items
                trialMaterials.map((material, index) => (
                  <div key={index}>
                    {material.pdfLink && (
                      <a
                        href={material.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        PDF Material {index + 1}
                      </a>
                    )}
                    {material.youtubeLink && (
                      <a
                        href={material.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        YouTube Material {index + 1}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No trial materials available.</p>
              )}
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayment;