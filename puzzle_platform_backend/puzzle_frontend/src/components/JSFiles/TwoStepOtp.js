import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckOtpImage from "../Images/Enter OTP-cuate.svg";
import "../CSSFiles/CheckOTPPage.css";

const TwoStepOtp = () => {
  const [otp, setOTP] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const fetchUserInfo = async () => {
      const email = localStorage.getItem("email");
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/send_otp_via_email/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );
        const data = await response.json();
        if (data.status) {
          console.log({ data });
        } else {
          console.error("Failed to fetch user information:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("email");
    console.log(email, otp);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/login_verify_otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.status) {
        // Redirect to the next page upon successful verification
        navigate("/puzzlepage");
      } else {
        console.log(data.message);
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Error verifying OTP. Please try again.");
    }
  };

  return (
    <div className="Checkotp-container">
      <div className="checkotp-Image-container">
        <img src={CheckOtpImage} alt="CkeckOtpImg" />
      </div>
      <div className="Checkotp-form-container">
        <div className={`Checkotp-Box ${message ? "error" : ""}`}>
          <h2 className="Header-Text">Verify OTP</h2>
          <p className="Text">An OTP has been sent. Please enter it below.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="otp">Enter code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Enter OTP"
            />
            <button type="submit">Verify OTP</button>
          </form>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default TwoStepOtp;
