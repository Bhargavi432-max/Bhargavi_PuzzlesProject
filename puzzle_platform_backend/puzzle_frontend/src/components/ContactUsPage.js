import React, { useState } from 'react';
import './ContactUsPage.css';

function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState(null);

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
    fetch('http://127.0.0.1:8000/api/contact_us/', {
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
      // Set submission status
      setSubmissionStatus('success');
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      // Set submission status
      setSubmissionStatus('error');
    });
  };

  return (
    <div className='contact-main'>
      <div className='text-contact'>If you need personalized assistance or have specific inquiries, feel free to reach out to our support team. You can contact us via email at support@example.com or by filling out the contact form below.</div>
      <div className="contact-container">
        {submissionStatus === 'success' ? (
          <p className="submission-message">Successfully submitted. Check your email.</p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-container">
              <label className="contact-lable" htmlFor="name">Name</label>
              <input
              className='contact-input'
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
              <label className="contact-lable" htmlFor="email">Email</label>
              <input
                className='contact-input'
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
              <label className="contact-lable" htmlFor="phoneNumber">Phone Number</label>
              <input
                className='contact-input'
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
        )}
      </div>
    </div>
  );
}

export default ContactUsPage;
