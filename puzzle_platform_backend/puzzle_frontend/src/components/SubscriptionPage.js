import React, { useState, useEffect } from 'react';
import "./SubscriptionPage.css";

function Wallet() {
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data and subscription plans when component mounts
    fetchUserData();
    fetchAllPlans();
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
        console.log(data);
        setUserData(data.subscription_details);
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const fetchAllPlans = () => {
    const email = localStorage.getItem("email"); // Assuming you store user email in localStorage
    if (!email) {
      setError("User email not found");
      return;
    }

    fetch("http://127.0.0.1:8000/api/get_all_plans/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        setPlans(data);
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const handleSubscribe = (planType) => {
    // Logic to handle subscription redirection
    console.log(`Subscribing to ${planType} plan`);
    // Redirect to payment page
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData || plans.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="user-info">
          <div className="user-details">
            <span className="username">{userData.name}</span>
            <span className="wallet-balance">Wallet Balance: {userData.wallet}</span>
            <span className="subscription">Subscription: {userData.plan_type}</span>
          </div>
        </div>
      </div>
      <div className="subscription-plans">
        {plans.map(plan => (
          <div key={plan.plan_type} className="plan">
            <h2>{plan.plan_type} Plan</h2>
            <p>${plan.price} per month</p>
            <button onClick={() => handleSubscribe(plan.plan_type)}>Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wallet;
