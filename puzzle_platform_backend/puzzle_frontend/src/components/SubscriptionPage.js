import React, { useState, useEffect } from 'react';
import "./SubscriptionPage.css";

function Wallet() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
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
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const handleSubscribe = (subscriptionType) => {
    // Logic to handle subscription redirection
    console.log(`Subscribing to ${subscriptionType} plan`);
    // Redirect to payment page
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="user-info">
          <div className="user-details">
            <span className="username">{userData.username}</span>
            <span className="wallet-balance">Wallet Balance: {userData.walletBalance}</span>
            <span className="subscription">Subscription: {userData.subscription}</span>
          </div>
        </div>
      </div>
      <div className="subscription-plans">
        <div className="plan">
          <h2>Basic Plan</h2>
          <p>$10 per month</p>
          <button onClick={() => handleSubscribe('Basic')}>Subscribe</button>
        </div>
        <div className="plan">
          <h2>Standard Plan</h2>
          <p>$20 per month</p>
          <button onClick={() => handleSubscribe('Standard')}>Subscribe</button>
        </div>
        <div className="plan">
          <h2>Premium Plan</h2>
          <p>$30 per month</p>
          <button onClick={() => handleSubscribe('Premium')}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
