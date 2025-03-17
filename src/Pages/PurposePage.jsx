import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const PurposePage = () => {
  const { user } = useUser(); // Retrieve user data from Clerk
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  // Handle adding a subject
  const handleAddSubject = () => {
    if (subjectInput.trim()) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput('');
    }
  };

  // Handle saving user data
  const handleSaveSubjects = async () => {
    const userData = {
      email: user.primaryEmailAddress.emailAddress,
      username: user.username || user.firstName,
      subjects,
    };

    try {
      const response = await fetch('http://localhost:5000/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert('Subjects saved successfully!');
        navigate('/success'); // Redirect to a success page
      } else {
        alert('Failed to save subjects.');
      }
    } catch (err) {
      console.error('Error saving subjects:', err);
      alert('An error occurred while saving subjects.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Purpose Page</h1>
      <p>What would you like to do?</p>

      {/* Learning and Teaching Buttons */}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => setShowSubjectInput(true)}>
          Learning
        </button>
        <button style={styles.button} onClick={() => alert('Teaching button clicked!')}>
          Teaching
        </button>
      </div>

      {/* Subject Input Field */}
      {showSubjectInput && (
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Enter a subject"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            style={styles.input}
          />
          <button style={styles.addButton} onClick={handleAddSubject}>
            Add Subject
          </button>
        </div>
      )}

      {/* Display the list of subjects */}
      {subjects.length > 0 && (
        <div style={styles.subjectList}>
          <h3>Your Subjects:</h3>
          <ul>
            {subjects.map((subject, index) => (
              <li key={index} style={styles.listItem}>
                {subject}
              </li>
            ))}
          </ul>
          <button style={styles.saveButton} onClick={handleSaveSubjects}>
            Save Subjects
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  buttonContainer: {
    margin: '20px 0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '0 10px',
  },
  inputContainer: {
    margin: '20px 0',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  subjectList: {
    marginTop: '20px',
  },
  listItem: {
    listStyleType: 'none',
    margin: '10px 0',
    fontSize: '18px',
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
  },
};

export default PurposePage;