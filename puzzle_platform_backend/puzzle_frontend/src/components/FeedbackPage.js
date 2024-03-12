import React, { useState } from 'react';
import './FeedbackPage.css';

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
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
    </div>
  );
}

export default FeedbackPage;
