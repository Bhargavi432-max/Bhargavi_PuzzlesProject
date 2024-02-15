import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginImage from "./Login-cuate.svg";
import "./Login.css";

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
        <div className="Login-container">
            <div className="Login-Image-container">
                <img src={LoginImage} alt="LoginImg" />
            </div>
            <div className="auth-form-container">
                <div className="Login-From">
                    <h2 className="Header-Login-Text">Login</h2>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" /><br />
                        <label htmlFor="password">Password:</label>
                        <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" /><br />
                        <p className="link-btn" id="Forgot" onClick={navigateToForgotPasswordPage}><span className="register-link">Forgot Password?</span></p>
                        <button type="submit" disabled={loading}>Log In</button>
                        {error && <p className="error-message">{error}</p>}
                    </form>

                    <p className="link-btn" onClick={navigateToRegister}>Don't have an account yet? <span className="register-link">Sign In</span></p>
                </div>
            </div>
        </div>
    )
}

export default Login;
