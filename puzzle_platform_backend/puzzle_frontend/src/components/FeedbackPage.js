import React, { useState } from 'react';
import './FeedbackPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const email = localStorage.getItem("email");

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send feedback data to backend endpoint
    const feedbackData = {
      email: email,
      rating: rating,
      review: comment // Change key to 'review' instead of 'comment'
    };

    fetch('http://127.0.0.1:8000/api/add_feedback/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Feedback submitted successfully:', data);
        // Reset form fields
        setRating(0);
        setComment('');
        // Display success toast message
        toast.success('Feedback submitted successfully.');
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
        // Display error toast message
        toast.error('Error submitting feedback. Please try again.');
      });
  };

  return (
    <div className='feedback-container'>
      <div className='main-text'>We appreciate your feedback</div>
      <div className='text-feedback'>We value your feedback and strive to improve our services based on your suggestions. Share your thoughts, ideas, and suggestions with us to help us enhance your user experience.</div>
      <form className='feedback-form' onSubmit={handleSubmit}>
        <div className='star-rating'>
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={value <= rating ? 'star active' : 'star'}
              onClick={() => handleStarClick(value)}
            >
              ★
            </span>
          ))}
        </div>
        <div className='comment-input-container'>
          <textarea
            className='comment-input'
            placeholder='What can we do to improve your experience?'
            value={comment}
            onChange={handleChange}
          ></textarea>
          <div className='feedback-button'>
            <button type='submit'>Submit</button>
          </div>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default FeedbackPage;
