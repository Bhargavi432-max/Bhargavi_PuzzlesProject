// PersonalInformationPage.js
import React, { useState, useEffect } from 'react';

const PersonalInformationPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    username: '',
    email: '',
    education: '',
    collegeName: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Fetch user information from the backend when the component mounts
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_user_info/');
      const data = await response.json();
      setUserInfo(data);
      setEditedInfo(data); // Set editedInfo to fetched user info initially
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo({
      ...editedInfo,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit edited user information to the backend
    try {
      const response = await fetch('http://127.0.0.1:8000/api/update_user_info/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedInfo)
      });
      if (response.ok) {
        // Refresh user information after successful update
        fetchUserInfo();
        setIsEditing(false);
      } else {
        console.error('Failed to update user information');
      }
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  return (
    <div>
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
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
      {isEditing && (
        <div>
          <h2>Edit Information</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" value={editedInfo.username} onChange={handleInputChange} />
            <input type="text" name="email" value={editedInfo.email} onChange={handleInputChange} />
            <input type="text" name="education" value={editedInfo.education} onChange={handleInputChange} />
            <input type="text" name="collegeName" value={editedInfo.collegeName} onChange={handleInputChange} />
            <input type="text" name="imageUrl" value={editedInfo.imageUrl} onChange={handleInputChange} />
            <button type="submit">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PersonalInformationPage;
