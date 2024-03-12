import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./forgotPassword.css";
import ForgotPasswordImage from "./Images/Forgot password-cuate.svg";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/forgot_password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok && data.status) {
                navigate('/checkotp', { state: { email } });

                // Send post request for logging forgot password request
                await fetch('http://127.0.0.1:8000/api/log_login_register_otp/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        action_item: 'forgot password request'
                    })
                });
                console.log("sucess");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='ForgotPassword-container'>
            <div className="Forgotpassord-Image-container">
                <img src={ForgotPasswordImage} alt="ForgotpasswordImg" />
            </div>
            <div className='ForgotPassword-form'>
                <div className='Forgot-box'>
                    <h2 className='Header-Text'>Forgot Password</h2>
                    <h2 className='Text'>Enter your email below to recover your password</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="User@gmail.com" />
                        <button type="submit">Submit</button>
                    </form>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
