import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';

const TestMainPage = () => {
    const { openSignUp } = useClerk();
    const { isSignedIn, user } = useUser(); // Retrieve user data from Clerk
    const navigate = useNavigate();
    const [showLearningInput, setShowLearningInput] = useState(false);
    const [showTeachingInput, setShowTeachingInput] = useState(false);
    const [experience, setExperience] = useState('');
    const [subjects, setSubjects] = useState([]); // Array of subjects
    const [profilePhotoPath, setProfilePhotoPath] = useState('');
    const [teacherData, setTeacherData] = useState(null); // State to store teacher data
    const [newSubject, setNewSubject] = useState(''); // Input for new subject
    const [newCourse, setNewCourse] = useState(''); // Input for new course
    const [newChapters, setNewChapters] = useState(''); // Input for new chapters
    const [editingSubjectIndex, setEditingSubjectIndex] = useState(null); // Index of the subject being edited
    const [editingCourseIndex, setEditingCourseIndex] = useState(null); // Index of the course being edited

    // Fetch teacher data when the component mounts or when the user signs in
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/get-teacher/${user.primaryEmailAddress.emailAddress}`
                );
                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();
                setSubjects(data.subjects || []);
                setExperience(data.experience || '');
                setProfilePhotoPath(data.profilePhotoPath || '');
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        if (isSignedIn) fetchTeacherData();
    }, [isSignedIn, user]);

    const handleSignUp = () => {
        if (isSignedIn) {
            // If the user is already signed in, redirect them to the PurposePage
            navigate('/purpose');
        } else {
            // If the user is not signed in, open the sign-up modal
            openSignUp({
                afterSignUp: () => navigate('/purpose'), // Redirect after successful sign-up
            });
        }
    };

    const handleLearningClick = () => {
        // Redirect to the student dashboard
        navigate('/student-dashboard');
    };

    const handleTeachingClick = () => {
        setShowTeachingInput(true);
        setShowLearningInput(false);
    };

    const handleAddSubject = () => {
        if (newSubject.trim()) {
            const subject = {
                subjectName: newSubject.trim(),
                courses: [],
            };
            setSubjects([...subjects, subject]);
            setNewSubject(''); // Clear the subject input
        }
    };

    const handleAddCourse = (subjectIndex) => {
        if (newCourse.trim() && newChapters.trim()) {
            const course = {
                courseName: newCourse.trim(),
                chapters: newChapters.split(',').map((chapter) => chapter.trim()),
            };
            const updatedSubjects = [...subjects];
            updatedSubjects[subjectIndex].courses.push(course);
            setSubjects(updatedSubjects);
            setNewCourse(''); // Clear the course input
            setNewChapters(''); // Clear the chapters input
        }
    };

    const handleDeleteSubject = (subjectIndex) => {
        const updatedSubjects = subjects.filter((_, index) => index !== subjectIndex);
        setSubjects(updatedSubjects);
    };

    const handleDeleteCourse = (subjectIndex, courseIndex) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[subjectIndex].courses = updatedSubjects[subjectIndex].courses.filter(
            (_, index) => index !== courseIndex
        );
        setSubjects(updatedSubjects);
    };

    const handleEditSubject = (subjectIndex) => {
        setEditingSubjectIndex(subjectIndex);
        setNewSubject(subjects[subjectIndex].subjectName);
    };

    const handleEditCourse = (subjectIndex, courseIndex) => {
        setEditingSubjectIndex(subjectIndex);
        setEditingCourseIndex(courseIndex);
        const course = subjects[subjectIndex].courses[courseIndex];
        setNewCourse(course.courseName);
        setNewChapters(course.chapters.join(', '));
    };

    const handleSaveSubject = (subjectIndex) => {
        if (newSubject.trim()) {
            const updatedSubjects = [...subjects];
            updatedSubjects[subjectIndex].subjectName = newSubject.trim();
            setSubjects(updatedSubjects);
            setNewSubject('');
            setEditingSubjectIndex(null);
        }
    };

    const handleSaveCourse = (subjectIndex, courseIndex) => {
        if (newCourse.trim() && newChapters.trim()) {
            const updatedSubjects = [...subjects];
            updatedSubjects[subjectIndex].courses[courseIndex] = {
                courseName: newCourse.trim(),
                chapters: newChapters.split(',').map((chapter) => chapter.trim()),
            };
            setSubjects(updatedSubjects);
            setNewCourse('');
            setNewChapters('');
            setEditingSubjectIndex(null);
            setEditingCourseIndex(null);
        }
    };

    const handleSaveTeaching = async () => {
        try {
            // Basic validation
            if (!experience || !subjects.length || !profilePhotoPath) {
                alert('Please fill all required fields');
                return;
            }

            const teacherData = {
                email: user.primaryEmailAddress.emailAddress,
                username: user.username || user.fullName,
                experience,
                subjects,
                profilePhotoPath
            };

            const response = await fetch('http://localhost:5000/api/save-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save data');
            }

            alert('Data saved successfully!');
            navigate('/teacher-dashboard', { state: { teacherData: result } });
        } catch (err) {
            console.error('Save error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    // In TestMainPage component
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
          const formData = new FormData();
          formData.append('profilePhoto', file); // Ensure the field name matches the server's expectation
  
          try {
              const response = await fetch('http://localhost:5000/api/upload/profile-photo', {
                  method: 'POST',
                  body: formData, // Include the FormData in the request body
              });
              const data = await response.json();
              setProfilePhotoPath(data.url); // Use the URL returned by the server
          } catch (error) {
              console.error('Upload error:', error);
              alert('Failed to upload photo');
          }
      }
  };
    return (
        <div className="flex items-center justify-center bg-cyan-950">
            <div style={styles.container} className='bg-cyan-800'>
                <h1 className='text-8xl'>Welcome to Kora</h1>
                <p>What would you like to do?</p>

                {/* Learning and Teaching Buttons */}
                <div style={styles.buttonContainer}>
                    <button style={styles.button} onClick={handleLearningClick}>
                        Learning
                    </button>
                    <button style={styles.button} onClick={handleTeachingClick}>
                        Teaching
                    </button>
                </div>

                {/* Teaching Input Fields */}
                {showTeachingInput && (
                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Experience in profession"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={styles.input}
                        />
                        {profilePhotoPath && (
                            <div style={styles.profilePhotoContainer}>
                                <img
                                    src={profilePhotoPath}
                                    alt="Profile"
                                    style={styles.profilePhoto}
                                />
                            </div>
                        )}

                        {/* Add Subject */}
                        <div style={styles.subjectInputContainer}>
                            <input
                                type="text"
                                placeholder="Enter subject name"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                style={styles.input}
                            />
                            <button
                                style={styles.addButton}
                                onClick={
                                    editingSubjectIndex !== null
                                        ? () => handleSaveSubject(editingSubjectIndex)
                                        : handleAddSubject
                                }
                            >
                                {editingSubjectIndex !== null ? 'Save Subject' : 'Add Subject'}
                            </button>
                        </div>

                        {/* Display Subjects and Courses */}
                        {subjects.map((subject, subjectIndex) => (
                            <div key={subjectIndex} style={styles.subjectContainer}>
                                <div style={styles.subjectHeader}>
                                    <h3>{subject.subjectName}</h3>
                                    <div>
                                        <button
                                            style={styles.editButton}
                                            onClick={() => handleEditSubject(subjectIndex)}
                                        >
                                            Edit Subject
                                        </button>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => handleDeleteSubject(subjectIndex)}
                                        >
                                            Delete Subject
                                        </button>
                                    </div>
                                </div>

                                {/* Add Course */}
                                <div style={styles.courseInputContainer}>
                                    <input
                                        type="text"
                                        placeholder="Enter course name"
                                        value={newCourse}
                                        onChange={(e) => setNewCourse(e.target.value)}
                                        style={styles.input}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter chapters (comma-separated)"
                                        value={newChapters}
                                        onChange={(e) => setNewChapters(e.target.value)}
                                        style={styles.input}
                                    />
                                    <button
                                        style={styles.addButton}
                                        onClick={
                                            editingCourseIndex !== null
                                                ? () => handleSaveCourse(subjectIndex, editingCourseIndex)
                                                : () => handleAddCourse(subjectIndex)
                                        }
                                    >
                                        {editingCourseIndex !== null ? 'Save Course' : 'Add Course'}
                                    </button>
                                </div>

                                {/* Display Courses */}
                                {subject.courses.map((course, courseIndex) => (
                                    <div key={courseIndex} style={styles.courseContainer}>
                                        <div style={styles.courseHeader}>
                                            <h4>{course.courseName}</h4>
                                            <div>
                                                <button
                                                    style={styles.editButton}
                                                    onClick={() => handleEditCourse(subjectIndex, courseIndex)}
                                                >
                                                    Edit Course
                                                </button>
                                                <button
                                                    style={styles.deleteButton}
                                                    onClick={() => handleDeleteCourse(subjectIndex, courseIndex)}
                                                >
                                                    Delete Course
                                                </button>
                                            </div>
                                        </div>
                                        <ul>
                                            {course.chapters.map((chapter, chapterIndex) => (
                                                <li key={chapterIndex}>{chapter}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Save Teaching Data */}
                        <button style={styles.saveButton} onClick={handleSaveTeaching}>
                            Save Teaching Data
                        </button>
                    </div>
                )}

                {/* Display the teacher's profile photo */}
                {teacherData && (
                    <div style={styles.profilePhotoContainer}>
                        <img
                            src={teacherData.profilePhotoPath}
                            alt="Profile"
                            style={styles.profilePhoto}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles
// Styles
// Styles
const styles = {
  container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '80%',
      maxWidth: '600px',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      border: '2px solid #333', // Changed to a darker border for better distinction
      backgroundColor: '#1b1b2e', // Dark background for the container
      color: '#ffffff', // White text for contrast against dark background
  },
  buttonContainer: {
      padding: '10px',
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'space-around',
      width: '100%',
      gap: '15px',
  },
  button: {
      padding: '10px 20px',
      fontSize: '16px',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      backgroundColor: '#0f3460', // Button background color
  },
  buttonHover: {
      backgroundColor: '#0f3460', // Darker shade for button hover effect
  },
  inputContainer: {
      margin: '20px 0',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
  },
  input: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      width: '100%',
  },
  subjectInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
  },
  courseInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
  },
  addButton: {
      padding: '10px',
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#28a745',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
  },
  addButtonHover: {
      backgroundColor: '#218838', // Darker shade for add button hover effect
  },
  editButton: {
      padding: '5px 10px',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: '#ffc107',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
  },
  deleteButton: {
      padding: '5px 10px',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: '#dc3545',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
  },
  saveButton: {
      padding: '10px 20px',
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#dc3545',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.3s',
  },
  profilePhotoContainer: {
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'center',
  },
  profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
  },
  subjectContainer: {
      margin: '20px 0',
      padding: '15px',
      border: '1px solid #ccc', // Keeping a light border for subjects
      borderRadius: '5px',
      backgroundColor: '#fff', // White background for better readability
      color: '#000', // Black text for subject
  },
  subjectHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
  },
  courseContainer: {
      margin: '10px 0',
      padding: '10px',
      border: '1px solid #eee',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9', // Light gray background for courses
      color: '#000', // Ensure text is black for course names
  },
  courseHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
  },
};


export default TestMainPage;