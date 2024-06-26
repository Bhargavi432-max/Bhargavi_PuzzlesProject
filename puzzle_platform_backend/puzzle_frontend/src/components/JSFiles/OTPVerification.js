import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VerificationImage from "../Images/Enter OTP-cuate.svg";
import "../CSSFiles/OTPVerification.css";

const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // Define message state
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state && location.state.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const userData = {
            email: email,
            otp: otp,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/verify_otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message); // Update message state
                if (data.status) {
                    navigateToLogin();
                    await fetch('http://127.0.0.1:8000/api/link_subscription_user/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            user_subscription_type: 'FREE'
                        })
                    });

                    // Send post request for logging OTP verification
                    await fetch('http://127.0.0.1:8000/api/log_login_register_otp/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            action_item: 'OTP verification successful'
                        })
                    });
                    console.log("succes");
                    
                }
            } else {
                setMessage('OTP verification failed. Please try again.'); // Update message state
            }
        } catch (error) {
            console.error('Error verifying OTP:', error.message);
            setError('OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const navigateToLogin = () => {
        navigate('/login');
    }

    return (
        <div className="Verification-container">
            <div className="Verification-Image-container">
                <img src={VerificationImage} alt="VerificationImg" />
            </div>
            <div className="Verification-form-container">
                <div className={`Verification-Box ${message ? 'error' : ''}`}>
                    <h2 className="Header-Text">Verify Code</h2>
                    <h2 className="Text">An authentication code has been sent to your email</h2>
                    <form className="otp-form" onSubmit={handleSubmit}>
                        <label htmlFor="otp">Enter code</label>
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="OTP" id="otp" name="otp" />
                        <button type="submit" disabled={loading}>Verify</button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </div>
            </div>
        </div>

    )
}

export default OTPVerification;
