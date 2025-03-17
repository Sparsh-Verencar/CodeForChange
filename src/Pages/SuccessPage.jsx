import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');
  const courseName = params.get('course');

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
      <p className="text-lg">
        You have successfully enrolled in <span className="text-blue-600">{courseName}</span>.
      </p>
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-6 hover:bg-blue-600"
        onClick={() => navigate('/student-dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default SuccessPage;