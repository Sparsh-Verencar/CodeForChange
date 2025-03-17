import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useUser } from '@clerk/clerk-react';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // State for teacher profile and card details
  const [teacherData, setTeacherData] = useState({ subjects: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    specialization: '',
    email: '', // Add this
    phoneNumber: '', // Add this
    location: '', // Add this
    photo: '',
    cardPhoto: '',
  });
  const [description, setDescription] = useState('');
  const [proofFile, setProofFile] = useState(null);

  // Fetch teacher data and card details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;

        // Fetch teacher data
        const teacherResponse = await fetch(
          `http://localhost:5000/api/get-teacher/${email}`
        );
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          setTeacherData(teacherData);
        }

        // Fetch card details
        const cardResponse = await fetch(
          `http://localhost:5000/api/get-profile-card-details/${email}`
        );
        if (cardResponse.ok) {
          const cardData = await cardResponse.json();
          setCardDetails(cardData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Handle input changes for card details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setCardDetails((prev) => ({ ...prev, photo: data.url }));
      }
    }
  };

  // Handle card body photo upload
  const handleCardPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setCardDetails((prev) => ({ ...prev, cardPhoto: data.url }));
      }
    }
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle proof file upload
  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  // Save profile and card details
  const handleSave = async () => {
    setIsEditing(false);

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      alert('User not authenticated');
      return;
    }

    try {
      // Save card details
      const cardResponse = await fetch('http://localhost:5000/api/save-profile-card-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cardDetails }),
      });

      if (!cardResponse.ok) {
        throw new Error('Failed to save card details');
      }

      // Save teacher profile
      const profileResponse = await fetch('http://localhost:5000/api/save-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username: cardDetails.name,
          experience: 'Experience details here', // Update as needed
          subjects: teacherData.subjects,
          profilePhotoPath: cardDetails.photo,
          description,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile');
      }

      alert('Profile and card details saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem} onClick={() => navigate('/teacher-dashboard')}>
            Home
          </li>
          <li style={styles.sidebarItem}>Profile</li>
          <li style={styles.sidebarItem}>Settings</li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header Card */}
        <div
          style={{
            ...styles.headerCard,
            backgroundImage: `url(${cardDetails.cardPhoto || 'https://via.placeholder.com/800x400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div style={styles.headerCardContent}>
            <div style={styles.profilePhotoContainer}>
              <img
                src={cardDetails.photo || 'https://via.placeholder.com/150'}
                alt="Profile"
                style={styles.profilePhoto}
              />
            </div>
            <div style={styles.headerCardDetails}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleInputChange}
                    style={styles.cardInput}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    name="specialization"
                    value={cardDetails.specialization}
                    onChange={handleInputChange}
                    style={styles.cardInput}
                    placeholder="Specialization"
                  />
                  <input
                    type="text"
                    name="email"
                    value={cardDetails.email}
                    onChange={handleInputChange}
                    style={styles.cardInput}
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={cardDetails.phoneNumber}
                    onChange={handleInputChange}
                    style={styles.cardInput}
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    name="location"
                    value={cardDetails.location}
                    onChange={handleInputChange}
                    style={styles.cardInput}
                    placeholder="Location"
                  />
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    style={styles.textArea}
                    placeholder="Describe yourself..."
                  />
                </>
              ) : (
                <>
                  <h2 style={styles.headerCardName}>{cardDetails.name}</h2>
                  <p><strong>Specialization:</strong> {cardDetails.specialization}</p>
                  <p><strong>Email:</strong> {cardDetails.email}</p>
                  <p><strong>Phone Number:</strong> {cardDetails.phoneNumber}</p>
                  <p><strong>Location:</strong> {cardDetails.location}</p>
                  <p>{description}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subjects & Courses Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Subjects & Courses</h2>
          {teacherData.subjects?.length > 0 ? (
            teacherData.subjects.map((subject, index) => (
              <div key={index} style={styles.subjectCard}>
                <h3 style={styles.subjectTitle}>{subject.subjectName}</h3>
                {subject.courses?.map((course, courseIndex) => (
                  <div key={courseIndex} style={styles.courseCard}>
                    <h4 style={styles.courseTitle}>{course.courseName}</h4>
                    <div style={styles.chapters}>
                      {course.chapters?.map((chapter, chapterIndex) => (
                        <span key={chapterIndex} style={styles.chapterPill}>
                          {chapter}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p style={styles.noSubjects}>No subjects and courses added yet</p>
          )}
        </div>

        {/* Photo Upload Section */}
        {isEditing && (
          <div style={styles.photoUploadSection}>
            <div style={styles.formGroup}>
              <label>Upload Profile Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                style={styles.fileInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Upload Card Background Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCardPhotoUpload}
                style={styles.fileInput}
              />
            </div>
          </div>
        )}

        {/* Proof Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Upload Proof of Certification</h2>
          <input type="file" accept=".pdf" onChange={handleProofUpload} style={styles.fileInput} />
          {proofFile && <p style={styles.fileName}>{proofFile.name}</p>}
        </div>

        {/* Save and Edit Buttons */}
        <div style={styles.actions}>
          {isEditing ? (
            <Button variant="primary" onClick={handleSave} style={styles.saveButton}>
              Save
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)} style={styles.editButton}>
              Edit
            </Button>
          )}
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
  headerCard: {
    borderRadius: '8px',
    padding: '20px',
    color: '#fff',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  headerCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '20px',
    borderRadius: '8px',
  },
  profilePhotoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
  headerCardDetails: {
    flex: 1,
  },
  headerCardName: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  cardInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  textArea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minHeight: '100px',
    resize: 'vertical',
  },
  photoUploadSection: {
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  fileInput: {
    marginTop: '5px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  fileName: {
    marginTop: '10px',
    color: '#555',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subjectTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  courseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px',
  },
  courseTitle: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#34495e',
  },
  chapters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  chapterPill: {
    backgroundColor: '#e9ecef',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '14px',
  },
};

export default TeacherProfile;