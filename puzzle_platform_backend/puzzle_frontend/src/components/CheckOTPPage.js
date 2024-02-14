import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
        <div>
            <h2>Check OTP</h2>
            <p>An OTP has been sent to {email}. Please enter it below.</p>
            <form onSubmit={handleSubmit}>
                <input type="text" value={otp} onChange={(e) => setOTP(e.target.value)} placeholder="Enter OTP" />
                <button type="submit">Check OTP</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CheckOTPPage;
