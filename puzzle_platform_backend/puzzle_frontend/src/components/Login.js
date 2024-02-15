import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
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
        };
        console.log(userData);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user_login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                setError(data.message);
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error registering:', error.message);
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const navigateToRegister = () => {
        navigate('/register');
    }

    const navigateToForgotPasswordPage = () => {
        navigate('/forgotpassword');
    }


    return (
        <div className="auth-form-container">
            <h2>Login Page!</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" /><br />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" /><br />
                <div className="login-forgot" onClick={navigateToForgotPasswordPage}>Forgot Password?</div>
                <button type="submit" disabled={loading}>Log In</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <button className="link-btn" onClick={navigateToRegister}>Don't have an account? Register here.</button>
        </div>
    )
}
