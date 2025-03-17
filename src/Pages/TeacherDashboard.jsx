import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';
import { Table } from '../components/ui/table';


const TeacherDashboard = () => {
  const location = useLocation();
  const teacherData = location.state?.teacherData || { subjects: [] };
  const navigate = useNavigate();
  const { user } = useUser();
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [trialMaterialLinks, setTrialMaterialLinks] = useState({
    pdfLink: '',
    youtubeLink: ''
  })

  // State for card customization
  const [cardDetails, setCardDetails] = useState({
    name: '',
    specialization: '',
    subject: '', // Add this line
    courseName: '',
    courseLength: '',
    photo: '',
    cardPhoto: '',
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        const response = await fetch(`http://localhost:5000/api/get-notifications/${email}`);
        if (response.ok) {
          const data = await response.json();
          setStudentNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    if (user) fetchNotifications();
  }, [user]);
  
  const handleTrialMaterialChange = (e) => {
    const { name, value } = e.target;
    setTrialMaterialLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTrialMaterials = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error('User not authenticated');
  
      const response = await fetch('http://localhost:5000/api/save-trial-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, trialMaterialLinks }),
      });
  
      if (!response.ok) throw new Error('Failed to save trial materials');
  
      alert('Trial materials saved successfully!');
    } catch (error) {
      console.error('Save trial materials error:', error);
      alert(`Failed to save trial materials: ${error.message}`);
    }
  };
  // Update the Student Joined section
  const handleStudentJoinedClick = () => {
    navigate('/student-joined', { state: { notifications: studentNotifications } });
  };
  // Fetch card details on component mount
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;
  
        const response = await fetch(
          `http://localhost:5000/api/get-profile-card-details/${email}`
        );
  
        if (response.ok) {
          const data = await response.json();
          setCardDetails({
            // Reset to empty values first
            name: '',
            specialization: '',
            courseName: '',
            courseLength: '',
            photo: '',
            cardPhoto: '',
            // Merge with fetched data
            ...data
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
  
    if (user) fetchCardDetails();
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile photo upload
// Handle profile photo upload
// Add upload progress indication
const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePhoto', file);
  
      try {
        const response = await fetch('http://localhost:5000/api/upload/profile-photo', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error('Upload failed');
        
        setCardDetails(prev => ({ 
          ...prev, 
          photo: data.url // Use the full URL directly
        }));
      } catch (error) {
        console.error('Upload error:', error);
        alert('Photo upload failed');
      }
    }
  };
  
  // Handle card photo upload
  const handleCardPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('cardPhoto', file); // Use correct field name
  
      try {
        const response = await fetch('http://localhost:5000/api/upload/card-photo', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setCardDetails((prev) => ({ ...prev, cardPhoto: data.url }));
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  // Save card details to the backend
  const handleSave = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error('User not authenticated');
  
      // Validate required fields before saving
      const requiredFields = ['name', 'courseName', 'photo', 'cardPhoto'];
      const missingFields = requiredFields.filter(field => !cardDetails[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      const response = await fetch('http://localhost:5000/api/save-profile-card-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          cardDetails: {
            ...cardDetails,
            // Ensure we're sending the latest photo URLs
            photo: cardDetails.photo,
            cardPhoto: cardDetails.cardPhoto
          }
        }),
      });
  
      const savedData = await response.json();
      if (!response.ok) throw new Error('Save failed');
      
      // Update state with fresh data from server
      setCardDetails(savedData);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    }
  };

  // Publish card
  // Update the handlePublish function
const handlePublish = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error('Authentication required');
  
      // Validate all required fields
      const requiredFields = [
        'name', 'specialization', 'subject',
        'courseName', 'courseLength',
        'photo', 'cardPhoto'
        
      ];
      const missingFields = requiredFields.filter(field => !cardDetails[field]);
      
      if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
  
      const response = await fetch('http://localhost:5000/api/publish-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          cardDetails: {
            name: cardDetails.name,
            specialization: cardDetails.specialization,
            courseName: cardDetails.courseName,
            subject: cardDetails.subject,
            courseLength: cardDetails.courseLength,
            photo: cardDetails.photo,
            cardPhoto: cardDetails.cardPhoto
            
          }
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Publish failed');
      
      alert('Card published successfully!');
      // Optionally refresh published cards list
    } catch (error) {
      console.error('Publish error:', error);
      alert(`Publish failed: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem}>Home</li>
          <li style={styles.sidebarItem}>Settings</li>
          <li style={styles.sidebarItem} onClick={() => navigate('/teacher-profile')}>
            Profile
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Custom Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Teacher Dashboard</h1>
          <div style={styles.headerButtons}>
            <Button variant="primary" onClick={() => navigate('/student-joined')}>
              Student Joined
            </Button>
            <Button variant="primary" onClick={() => navigate('/student-chatroom')}>
              Student Chatroom
            </Button>
          </div>
        </div>

        {/* Table to Display Data */}
        <Table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Subject</th>
              <th style={styles.tableHeader}>Course Name</th>
              <th style={styles.tableHeader}>Chapters</th>
            </tr>
          </thead>
          <tbody>
            {teacherData.subjects.map((subject, subjectIndex) =>
              subject.courses.map((course, courseIndex) => (
                <tr key={`${subjectIndex}-${courseIndex}`} style={styles.tableRow}>
                  <td style={styles.tableCell}>{subject.subjectName}</td>
                  <td style={styles.tableCell}>{course.courseName}</td>
                  <td style={styles.tableCell}>{course.chapters.join(', ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Card Customization Section */}
        <div style={styles.cardCustomization}>
          <h2 style={styles.sectionTitle}>Customize Your Card</h2>
          <form style={styles.form}>
            <div style={styles.formGroup}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={cardDetails.name}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Specialization:</label>
              <input
                type="text"
                name="specialization"
                value={cardDetails.specialization}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Course Name:</label>
              <input
                type="text"
                name="courseName"
                value={cardDetails.courseName}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Course Length:</label>
              <input
                type="text"
                name="courseLength"
                value={cardDetails.courseLength}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
  <label>Subject:</label>
  <input
    type="text"
    name="subject"
    value={cardDetails.subject}
    onChange={handleInputChange}
    style={styles.input}
  />
</div>
            <div style={styles.formGroup}>
              <label>Upload Profile Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Upload Card Background Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCardPhotoUpload}
                style={styles.input}
              />
            </div>
          </form>

          {/* Card Preview Section */}
          <div style={styles.previewSection}>
            <h2 style={styles.sectionTitle}>Card Preview</h2>
            <div style={{
  ...styles.cardPreview,
  backgroundImage: cardDetails.cardPhoto ? `url(${cardDetails.cardPhoto})` : '#f9f9f9'
}}>
  {cardDetails.photo && (
    <img 
      src={cardDetails.photo} 
      alt="Profile" 
      style={styles.cardImage}
      onError={(e) => {
        e.target.style.display = 'none'; // Hide broken images
      }}
    />
  )}
 <div style={styles.cardDetails}>
  <p><strong>Name:</strong> {cardDetails.name || 'Not specified'}</p>
  <p><strong>Subject:</strong> {cardDetails.subject || 'Not specified'}</p>
  <p><strong>Specialization:</strong> {cardDetails.specialization || 'Not specified'}</p>
  <p><strong>Course Name:</strong> {cardDetails.courseName || 'Not specified'}</p>
  <p><strong>Course Length:</strong> {cardDetails.courseLength || 'Not specified'}</p>
</div>
</div>
<div style={styles.uploadTrialMaterialSection}>
  <h2 style={styles.sectionTitle}>Upload Trial Material</h2>
  <div style={styles.formGroup}>
    <label>PDF Link:</label>
    <input
      type="text"
      name="pdfLink"
      value={trialMaterialLinks.pdfLink}
      onChange={handleTrialMaterialChange}
      style={styles.input}
    />
  </div>
  <div style={styles.formGroup}>
    <label>YouTube Link:</label>
    <input
      type="text"
      name="youtubeLink"
      value={trialMaterialLinks.youtubeLink}
      onChange={handleTrialMaterialChange}
      style={styles.input}
    />
  </div>
  <Button variant="primary" onClick={handleSaveTrialMaterials} style={styles.saveButton}>
    Save Trial Material
  </Button>
</div>

            {/* Publish Button */}
            <Button
              variant="primary"
              onClick={handlePublish}
              style={{ ...styles.saveButton, backgroundColor: '#28a745' }}
            >
              Publish Card
            </Button>
          </div>

          {/* Save Button */}
          <Button variant="primary" onClick={handleSave} style={styles.saveButton}>
            Save Card Details
          </Button>
        </div>
      </div>
      
    </div>


  );
};

// Styles (same as before)
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '20px',
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  sidebarList: {
    listStyle: 'none',
    padding: '0',
  },
  sidebarItem: {
    marginBottom: '10px',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
  },
  cardCustomization: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  previewSection: {
    marginTop: '20px',
  },
  cardPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    minHeight: '200px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #fff',
  },
  cardDetails: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '15px',
    borderRadius: '8px',
  },
  saveButton: {
    marginTop: '20px',
  },
  uploadTrialMaterialSection: {
    marginTop: '40px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
};

export default TeacherDashboard;