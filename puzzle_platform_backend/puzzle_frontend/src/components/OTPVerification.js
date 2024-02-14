import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OTPVerification = ({ email }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Send OTP for verification
        try {
            const response = await fetch('http://127.0.0.1:8000/api/verify_otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email,otp})
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                console.log(data.login_status)
                setError(data.message);
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
        <div className="auth-form-container">
            <h2>OTP Verification</h2>
            <form className="otp-form" onSubmit={handleSubmit}>
                <p>An OTP has been sent to {email}. Please enter it below.</p>
                <label htmlFor="otp">Enter OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="OTP" id="otp" name="otp" />
                <br />
                <button type="submit" onClick={navigateToLogin} disabled={loading}>Verify OTP</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    )
}

export default OTPVerification;
