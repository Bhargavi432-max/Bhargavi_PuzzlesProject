import React, { useState, useEffect } from 'react';
import useRazorpay from "react-razorpay";
import def from "../Images/defualtImage.jpg";
import "../CSSFiles/BalancePage.css";

const BalancePage = () => {
  const [balance, setBalance] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [imagepath, setImagePath] = useState(null);
  const [Razorpay] = useRazorpay(); 
  
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

  const handleSave = async () => {
    if (balance <= 0) {
      setError("Please enter a valid positive number for balance.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/order_create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: balance,
          email: localStorage.getItem("email"),
          pay_type: 'wallet',
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch Razorpay payment details");
      }
  
      const paymentDetails = await response.json();
  
      if (!window.Razorpay) {
        throw new Error("Razorpay library not loaded");
      }
  
      const options = {
        key: paymentDetails.razorpay_merchant_key,
        amount: paymentDetails.razorpay_amount,
        currency: paymentDetails.currency,
        name: "Dj Razorpay",
        order_id: paymentDetails.razorpay_order_id,
        callback_url: paymentDetails.callback_url,
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while processing the donation.");
    }
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
      <div className="balance-input-container">
        <h2>Add money to Wallet</h2>
        <input
          type="text"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Enter balance"
        />
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default BalancePage;
