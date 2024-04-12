import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "../CSSFiles/SecurityPage.css";

const SecurityPage = () => {
  const navigate = useNavigate();
  const [isTwoStepVerificationEnabled, setIsTwoStepVerificationEnabled] = useState(false);

  const handleToggle = () => {
    const newStatus = !isTwoStepVerificationEnabled;
    setIsTwoStepVerificationEnabled(newStatus);
    updateTwoStepVerificationStatus(newStatus); // Call function to update status
  };

  const navigateToChangePassword = () => {
    navigate("/changepassword");
  };

  useEffect(() => {
    // Fetch two-step verification status from the backend when the component mounts
    fetchTwoStepVerificationStatus();
  }, []);

  const fetchTwoStepVerificationStatus = () => {
    const email = localStorage.getItem("email"); // Assuming you store user email in localStorage

    fetch("http://127.0.0.1:8000/api/get_twostep_status/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        return response.json();
      })
      .then((data) => {
        console.log({data});
        if (data && data.success && typeof data.is_twostep_active === 'boolean') {
          setIsTwoStepVerificationEnabled(data.is_twostep_active);
        } else {
          throw new Error("Invalid response data");
        }
      })
      .catch((error) => {
        console.error('Error fetching two-step verification status:', error);
      });
  };

  const updateTwoStepVerificationStatus = (newStatus) => {
    const email = localStorage.getItem("email"); // Assuming you store user email in localStorage
    console.log({newStatus});
    fetch("http://127.0.0.1:8000/api/update_twostep_status/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email: email, 
        is_twostep_active : newStatus,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update two-step verification status");
        }
      })
      .catch((error) => {
        console.error('Error updating two-step verification status:', error);
      });
  };

  return (
    <div>
      <div className='securtytext-box'>
        <div className='security-teaxt'>Security</div>
      </div>
      <div className="security-options">
        <div className="security-option">
          <div className='verification-option'>Password Management</div>
          <div className="toggle-slider">
            <span>Two-Step Verification</span>
            <input
              type="checkbox"
              id="toggle"
              checked={isTwoStepVerificationEnabled}
              onChange={handleToggle}
            />
            <label htmlFor="toggle" className="slider" />
          </div>
        </div>
        <div className="security-option">
          <div className='verification-option'>Password Security</div>
          <div className="toggle-slider">
            <span>Password Change</span>
            <button onClick={navigateToChangePassword} className="change-password-button">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
