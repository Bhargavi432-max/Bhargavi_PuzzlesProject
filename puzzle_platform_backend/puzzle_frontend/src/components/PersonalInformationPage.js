import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import './PersonalInformationPage.css';

const PersonalInformationPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedInfo, setEditedInfo] = useState({
    username: '',
    email: '',
    education: '',
    collegeName: '',
    imageFile: null // Store file object here
  });

  useEffect(() => {
    // Fetch user information from the backend when the component mounts
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const email = localStorage.getItem('email');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_user_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        console.log({data});
        const userData = data.user_data;
        setUserInfo({
          username: userData.username,
          email: userData.email,
          education: userData.education,
          collegeName: userData.college_name,
          imageUrl: userData.profile_image
        });
        setEditedInfo({
          username: userData.username,
          email: userData.email,
          education: userData.education,
          collegeName: userData.college_name,
          imageFile: null // Initialize imageFile as null
        });
      } else {
        console.error('Failed to fetch user information:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    console.log("Name:", name);
    console.log("Value:", value);
    console.log("Files:", files);
    
    if (name === 'profile_image') {
      setEditedInfo({
        ...editedInfo,
        [name]: files[0] // Store the selected file
      });
    } else {
      setEditedInfo({
        ...editedInfo,
        [name]: value
      });
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('username', editedInfo.username);
    formData.append('email', editedInfo.email);
    formData.append('education', editedInfo.education);
    formData.append('college_name', editedInfo.collegeName);
    formData.append('profile_image', editedInfo.imageFile); // Check if imageFile is properly appended
  
    console.log("FormData:", formData); // Log FormData object to console
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_user_info/', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        fetchUserInfo();
        setIsEditing(false);
        console.log('User information updated successfully');
      } else {
        throw new Error('Failed to update user information');
      }
    } catch (error) {
      console.error('Error updating user information:', error);
      setError('Failed to update user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div>
      <div className={isEditing ? 'edit-icon active' : 'edit-icon'} onClick={handleEditClick}>
        <FontAwesomeIcon icon={faEdit} style={{ color: '#3B4AB4' }} />
      </div>
      {userInfo && !isEditing && (
        <div>
          <h2>General Information</h2>
          <div>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
            <p>Education: {userInfo.education}</p>
            <p>College Name: {userInfo.collegeName}</p>
            <img src={userInfo.imageUrl} alt="User" />
          </div>
        </div>
      )}
      {isEditing && (
        <div>
          <h2>Edit Information</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input type="text" name="username" value={editedInfo.username} onChange={handleInputChange} />
            <label htmlFor="email">Email:</label>
            <input type="email" name="email" value={editedInfo.email} onChange={handleInputChange} />
            <label htmlFor="education">Education:</label>
            <input type="text" name="education" value={editedInfo.education} onChange={handleInputChange} />
            <label htmlFor="collegeName">College Name:</label>
            <input type="text" name="collegeName" value={editedInfo.collegeName} onChange={handleInputChange} />
            <label htmlFor="imageFile">Profile Picture:</label>
            <input type="file" name="imageFile" onChange={handleInputChange} accept="image/*" />
            <button type="submit" disabled={loading}>Save</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default PersonalInformationPage;
