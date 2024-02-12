import React, { useState } from "react";

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        // console.log(email);

        const userData = {
            email:email,
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
            }
            // Optionally, you can show a success message or redirect the user
        } catch (error) {
            console.error('Error registering:', error.message);
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-form-container">
            <h2>Login Page!</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" /><br/>
                <label htmlFor="password">password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" /><br/>
                <button type="submit">Log In</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch('register')}>Don't have an account? Register here.</button>
        </div>
    )
}