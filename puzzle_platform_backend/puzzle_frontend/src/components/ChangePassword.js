import React, { useState } from 'react';
import "./ChangePassword.css";
import ChangePasswordImage from"./Images/Secure data-cuate.svg";
function ChangePassword() {
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/change_password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage('Failed to change password');
        }
    };

    return (
        <div className='ChangePassword-container'>
             <div className="ChangePassword-Image-container">
                <img src={ChangePasswordImage}  className="ChangePasswordimage"alt="ChangepasswordImg" />
            </div>
            <div className='ChangePassword-form'>
                <div className='ChangePassword-Box'>
                    <h2 className='Header-Text'>Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                        <label htmlFor="email">Email</label>
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        <label htmlFor="password">Old Password</label>
                        <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                        <label htmlFor="password">New Password</label>
                        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <button onClick={handleChangePassword}>Change Password</button>
                        {message && <p>{message}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;