import React, { useState, useEffect } from "react";
import "./SubscriptionPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRazorpay from "react-razorpay";
import ProfileImage from "./Images/Profile photo.svg";
import { FaCheck } from "react-icons/fa";

function Wallet() {
  const [Razorpay] = useRazorpay();
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch subscription plans");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.plans)) {
          console.log(data.plans);
          setPlans(data.plans);
        } else {
          setError("Received plans data is not in the expected format");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleSubscribe = async (planType, planPrice) => {
    if (planPrice === "0.00") {
      console.log("Plan price is 0, displaying toast message");
      toast.info("This plan is a free plan!"); // Display toast message for free plan
      return;
    }

    // Logic to handle subscription redirection
    console.log(`Subscribing to ${planType} plan`);
    // Redirect to payment page

    // Get the user's email from localStorage
    const userEmail = localStorage.getItem("email");

    // Check if the user's email exists
    if (!userEmail) {
      setError("User email not found");
      return;
    }

    // Now you can store the user's email and the plan price in variables or state
    // For example:
    const subscriptionData = {
      email: userEmail,
      planType: planType,
      planPrice: planPrice,
    };
    console.log(subscriptionData.planPrice);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/order_create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: subscriptionData.planPrice,
          email: subscriptionData.email,
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
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData || plans.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-container">
      <ToastContainer />
      <div className="wallet-header">
        <div className="user-info">
          <div className="prof-image">
            <img src={ProfileImage} alt="ProfileImage" />
          </div>
          <div className="user-subdetails">
            <div className="username">Hello, {userData.name}</div>
            <div className="wallet-balance">
              <span className="text">Wallet Balance</span>
              <br />
              {userData.wallet}
            </div>
            {/* <div className="subscription">
              <span className="text">Current Plan </span>
              <br />
              {userData.plan_type}
            </div> */}
          </div>
        </div>
        <div className="message-con">
          <div className="message">My Subscription</div>
        </div>
      </div>
      <div className="subscription-plans">
        {plans.map((plan) => (
          <div key={plan.plan_type} className="plan">
            <h2 className="plan-text">{plan.plan_type} PLAN</h2>
            <div className="benefits">
              {plan.benefits.split("\r\n").map((benefit, index) => (
                <div key={index} className="benefit">
                  <FaCheck
                    className="tick-icon"
                    style={{
                      backgroundColor: "green",
                      borderRadius: "50%",
                      color: "white",
                      padding: "2px",
                      marginRight: "10px",
                    }}
                  />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <p className="price">
              <span className="price-text">per month</span>
              <br />${plan.plan_price}
            </p>
            <button
              onClick={() => handleSubscribe(plan.plan_type, plan.plan_price)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Wallet;
