import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckOtpImage from "./Images/Enter OTP-cuate.svg"; 
import "./CheckOTPPage.css";

const CheckOTPPage = () => {
    const [otp, setOTP] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state && location.state.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/check_otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok && data.status) {
                navigate('/resetpassword', { state: { email } });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='Checkotp-container'>
            <div className="checkotp-Image-container">
                <img src={CheckOtpImage} alt="CkeckOtpImg" />
            </div>
            <div className='Checkotp-form-container'>
            <div className={`Checkotp-Box ${message ? 'error' : ''}`}>
                <h2 className='Header-Text'>Verify OTP</h2>
                <p className='Text'>An OTP has been sent. Please enter it below.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="otp">Enter code</label>
                    <input type="text" value={otp} onChange={(e) => setOTP(e.target.value)} placeholder="Enter OTP" />
                    <button type="submit">Verify OTP</button>
                </form>
                {message && <p className="error-message">{message}</p>}
            </div>
            </div>
        </div>
    );
};

export default CheckOTPPage;
