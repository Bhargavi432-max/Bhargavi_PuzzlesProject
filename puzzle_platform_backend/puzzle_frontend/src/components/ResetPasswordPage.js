import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResetPasswordImage from "./Images/Secure data-cuate.svg";
import "./ReserPasswordPage.css";

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state && location.state.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/reset_password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, new_password: newPassword, confirm_password: confirmPassword })
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok && data.status) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='ResetPassword-container'>
             <div className="ResetPassword-Image-container">
                <img src={ResetPasswordImage}  className="Resetimage"alt="ResetpasswordImg" />
            </div>
            <div className='Resetpassword-form'>
                <div className='ResetPassword-Box'>
                    <h2 className='Header-Text'>Set a Password</h2>
                    <p className='Text'>Set a new password for your account</p>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="password">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                        <label htmlFor="password">Confrim Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                        <button type="submit">Reset Password</button>
                        {message && <p>{message}</p>}
                    </form>
                    
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
