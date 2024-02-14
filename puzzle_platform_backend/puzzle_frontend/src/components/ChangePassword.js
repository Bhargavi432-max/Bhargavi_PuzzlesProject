import React, { useState } from 'react';

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
        <div>
            <h2>Change Password</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <br />
            <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <br />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <br />
            <button onClick={handleChangePassword}>Change Password</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default ChangePassword;