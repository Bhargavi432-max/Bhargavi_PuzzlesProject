import React, { useState, useEffect } from 'react';
import "./SubscriptionPage.css";
import ProfileImage from "./Images/Profile photo.svg";

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
        if (Array.isArray(data.plans)) {
          setPlans(data.plans);
        } else {
          setError("Received plans data is not in the expected format");
        }
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
        <div className="prof-image">
          <img src={ProfileImage} alt='ProfileImage'/>
        </div>
        <div className="user-details">
          <div className="username">Heloo, {userData.name}</div>
          <div className="wallet-balance">
            <span className='text'>Wallet Balance</span>
            <br/>
            {userData.wallet}
          </div>
          <div className="subscription">
            <span className='text'>Current Plan </span>
            <br/>
            {userData.plan_type}
          </div>
        </div>
      </div>
      <div className='message-con'>
        <div className="message">My Wallet</div>
      </div>
    </div>
    <div className="subscription-plans">
      {plans.map(plan => (
        <div key={plan.plan_type} className="plan">
          <h2 className='plan-text'>{plan.plan_type} PLAN</h2>
          <p className='benefits'>{plan.benefits}</p>
          <p className='price'><span className='price-text'>per month</span>
            <br/>${plan.plan_price}
          </p>
          <button onClick={() => handleSubscribe(plan.plan_type)}>Subscribe</button>
        </div>
      ))}
    </div>
  </div>
);
}
export default Wallet;
