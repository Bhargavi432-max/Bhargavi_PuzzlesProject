import React, { useState } from 'react';
import './ContactUsPage.css';

function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send form data to backend endpoint
    fetch('backend_endpoint_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Form submitted successfully:', data);
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        phoneNumber: ''
      });
    })
    .catch(error => {
      console.error('Error submitting form:', error);
    });
  };

  return (
    <div className='contact-main'>
      <div className='text-contact'>If you need personalized assistance or have specific inquiries, feel free to reach out to our support team. You can contact us via email at support@example.com or by filling out the contact form below.</div>
      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              placeholder='users name'
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder='user@gmail.com'
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder='mobile number'
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default ContactUsPage;
