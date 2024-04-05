import React, { useState, useEffect } from 'react';
import def from "./defualtImage.jpg";
import "./BalancePage.css";

const BalancePage = () => {
  const [balance, setBalance] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [imagepath, setImagePath] = useState(null);
  
  useEffect(() => {
    // Fetch user data and subscription plans when component mounts
    fetchUserData();
    fetchUserInfo();
  }, []);

  const fetchUserData = () => {
    const email = localStorage.getItem("email"); // Assuming you store user email in localStorage
    if (!email) {
      setError("User email not found");
      return;
    }

    fetch("http://127.0.0.1:8000/api/get_subscription_details/", {
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
        setUserData(data.subscription_details);
      })
      .catch((error) => {
        setError(error.message);
      });
  };
  
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
          const path = require("../profile_image/" + filename);
          setImagePath(path);
        } else {
          // Set default image path if no image is provided
          setImagePath(def);
        }
      } else {
        console.error('Failed to fetch user information:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleSave = () => {
    // Add your save logic here
    console.log('Balance saved:', balance);
  };

  return (
    <div className='Balance'>
      {userData && (
        <div className="wallet-header">
          <div className="user-info">
            <div className="prof-image">
              <img src={imagepath || def} alt="ProfileImage" />
            </div>
            <div className="user-subdetails">
              <div className="username-Balance">Hello, {userData.name}</div>
              <div className="wallet-balances">
                <span className="text">Wallet Balance:</span>
                {userData.wallet}
              </div>
              {/* <div className="subscription">
                <span className="text">Current Plan </span>
                <br />
                {userData.plan_type}
              </div> */}
            </div>
          </div>
          <div className="message-Balance">
            <div className="message-BalanceText">My Wallet</div>
          </div>
        </div>
      )}
      <h1>Balance:</h1>
      <input
        type="text"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="Enter balance"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default BalancePage;
