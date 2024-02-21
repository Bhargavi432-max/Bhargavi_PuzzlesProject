// ForgotPassword.js

import React, { useState } from 'react';
import './forgotPassword.css'; // Import your CSS file

function ForgotPassword(){
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement password recovery logic here
    console.log(`Recover password for email: ${email}`);
  };

  return (
    <div className="forgot-password-container">
      <div className="image-placeholder"></div> {/* Add your image here */}
      <div className="form-container">
        <h2>FORGOT YOUR PASSWORD?</h2>
        <h5>Enter your email below to recover your password</h5>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
          />
          <button type="submit">Submit</button>
        </form>
        <p>or continue with</p>
        {/* Add social media login buttons here */}
      </div>
    </div>
  );
};

export default ForgotPassword;
