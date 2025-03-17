import React from 'react';
import { useLocation } from 'react-router-dom';

const StudentJoined = () => {
  const { state } = useLocation();
  const notifications = state?.notifications || [];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Student Subscriptions</h2>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p>Student: {notification.studentName}</p>
            <p>Course: {notification.courseName}</p>
            <p>Joined: {new Date(notification.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentJoined;