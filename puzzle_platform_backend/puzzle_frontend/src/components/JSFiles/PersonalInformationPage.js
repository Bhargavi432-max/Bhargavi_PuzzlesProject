import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../CSSFiles/PersonalInformationPage.css";
import def from "../Images/defualtImage.jpg";

const PersonalInformationPage = ({onEdit} ) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagepath, setImagePath] = useState(null);
  const [editedInfo, setEditedInfo] = useState({
    username: "",
    email: "",
    education: "",
    collegeName: "",
    imageFile: null, // Store file object here
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
        const imageFileName = userData.profile_image;
        if (imageFileName) {
          const filePath = imageFileName;
          const filename = filePath.split("/").pop();
          const path = require(".../profile_image/" + filename);
          setImagePath(path);
        } else {
          // Set default image path if no image is provided
          setImagePath(def);
        }
        setUserInfo({
          username: userData.username,
          email: userData.email,
          education: userData.education,
          collegeName: userData.college_name,
        });
        setEditedInfo({
          username: userData.username,
          email: userData.email,
          education: userData.education,
          collegeName: userData.college_name,
          imageFile: imagepath // Initialize imageFile as null
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
    // Call onEdit when editing is enabled
    onEdit();
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      setEditedInfo({
        ...editedInfo,
        [name]: files[0], // Store the selected file
      });
    } else {
      setEditedInfo({
        ...editedInfo,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("username", editedInfo.username);
      formData.append("email", editedInfo.email);
      formData.append("education", editedInfo.education);
      formData.append("collegeName", editedInfo.collegeName);
      formData.append("imageFile", editedInfo.imageFile); // Append image file to FormData
      console.log({"edited":{formData}});
      const response = await fetch("http://127.0.0.1:8000/api/get_user_info/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.status === true) {
        console.log(data.message);
        setIsEditing(false);
        // Fetch user information again to display the latest data
        fetchUserInfo();
      } else {
        setError(data.message || "Failed to update user information");
      }
    } catch (error) {
      console.error("Error updating user information:", error);
      setError("Failed to update user information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className={isEditing ? "edit-icon active" : "edit-icon"}
        onClick={handleEditClick}
      >
        <FontAwesomeIcon icon={faEdit} style={{ color: "#3B4AB4" }} />
      </div>
      {userInfo && !isEditing && (
        <div>
          <div className="maintext-personal">
            <h4 className="text-personal">General Information</h4>
          </div>
          <div className="details-container">
            <div className="person-image">
              <img src={imagepath || def} alt="User" />
            </div>
            <div className="details-box">
              <p>Username: <span className="details-user">{userInfo.username}</span></p>
              <p>Email:<span className="details-user"> {userInfo.email}</span></p>
              <p>Education:<span className="details-user"> {userInfo.education}</span></p>
              {userInfo.collegeName && (
                <p>College Name:<span className="details-user"> {userInfo.collegeName}</span></p>
              )}
            </div>
          </div>
        </div>
      )}
      {isEditing && (
        <div>
          <div className="text-edit">
            <div className="text-editinfo">Edit Information</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="edit-from">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editedInfo.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="education">Education</label>
                <input
                  type="text"
                  name="education"
                  value={editedInfo.education}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="collegeName">College Name</label>
                <input
                  type="text"
                  name="collegeName"
                  value={editedInfo.collegeName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="imageFile">Profile Picture</label>
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </div>
            </div>
            <button className="personal-save "type="submit" disabled={loading}>
              Save
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default PersonalInformationPage;
