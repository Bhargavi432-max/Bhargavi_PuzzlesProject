import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Register = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const userData = {
            email: email,
            password: pass,
            username: name,
            mobile_number: phone
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register_user/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                console.log(data.login_status)
                setError(data.message);
                navigate('/otp', { state: { email: email } });
            }
        } catch (error) {
            console.error('Error registering:', error.message);
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const navigateToLogin = () => {
        navigate('/login');
    }

    // const navigateToOtp = () => {
    //     navigate('/otp');
    // }


    return (
        <div className="auth-form-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Full name</label>
                <input value={name} name="name" onChange={(e) => setName(e.target.value)} id="name" placeholder="Full Name" />
                <br />
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
                <br />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <br />
                <label htmlFor="phone">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" placeholder="Phone Number" id="phone" name="phone" />
                <br />
                <button type="submit" disabled={loading}>Register</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <button className="link-btn" onClick={navigateToLogin}>Already have an account? Login here.</button>
        </div>
    )
}
