import React, { useState } from "react";

export const Register = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email, pass, name, phone);

        try {
            // Call a function to send OTP to the registered email
            await sendOtpEmail(email);
            // Optionally, you can show a success message or navigate to a verification page
            console.log("OTP sent successfully.");
        } catch (error) {
            // Handle error if OTP sending fails
            console.error("Error sending OTP:", error);
        }
    }

    const sendOtpEmail = async (email) => {
        // Replace this function with the implementation using your email service provider
        // For example, you could use a service like SendGrid, Mailgun, etc.
        const otp = generateOTP(); // Generate OTP
        // Here you would make an API call to your backend server
        // which then sends an email with the OTP to the provided email address
        // Example implementation:
        const response = await fetch('http://127.0.0.1:8000/api/register_user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        });
        if (!response.ok) {
            throw new Error('Failed to send OTP');
        }
    }

    const generateOTP = () => {
        // Generate OTP logic
        return Math.floor(100000 + Math.random() * 900000); // Example OTP generation
    }

    return (
        <div className="auth-form-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Full name</label>
                <input value={name} name="name" onChange={(e) => setName(e.target.value)} id="name" placeholder="Full Name" />
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <label htmlFor="phone">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" placeholder="Phone Number" id="phone" name="phone" />
                <button type="submit">Register</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch('login')}>Already have an account? Login here.</button>
        </div>
    )
}
