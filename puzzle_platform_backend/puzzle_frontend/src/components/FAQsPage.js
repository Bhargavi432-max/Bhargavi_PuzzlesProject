import React, { useState } from 'react';
function FAQSection() {
    const faqs = [
      { question: 'Question 1', answer: 'Answer 1' },
      { question: 'Question 2', answer: 'Answer 2' },
      { question: 'Question 3', answer: 'Answer 3' },
      // Add more FAQs as needed
    ];
  
    return (
      <div className="faq-section">
        {faqs.map((faq, index) => (
          <div className="faq" key={index}>
            <div className="question">{faq.question}</div>
            <div className="answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    );
  }
export default FAQSection;  