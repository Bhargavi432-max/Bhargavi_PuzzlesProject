import React, { useState } from 'react';
import './HelpAndSupportPAge.css';
import FAQSection from "./FAQsPage";
import ContactUsPage from "./ContactUsPage";
import FeedbackPage from "./FeedbackPage";

function Helpandsupport() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName === 'FAQs') {
      setShowFAQ(true);
      setShowContactUs(false);
      setShowFeedback(false);
    } else if (buttonName === 'Contact Us') {
      setShowFAQ(false);
      setShowContactUs(true);
      setShowFeedback(false);
    } else if (buttonName === 'Feedback') {
      setShowFAQ(false);
      setShowContactUs(false);
      setShowFeedback(true);
    } else {
      setShowFAQ(false);
      setShowContactUs(false);
      setShowFeedback(false);
    }
  };

  return (
    <div className="help-container">
      <div className="content-help">
        <div className="buttons-help">
          <button
            className={activeButton === 'FAQs' ? 'active' : ''}
            onClick={() => handleButtonClick('FAQs')}
          >
            FAQs
          </button>
          <button
            className={activeButton === 'Contact Us' ? 'active' : ''}
            onClick={() => handleButtonClick('Contact Us')}
          >
            Contact Us
          </button>
          <button
            className={activeButton === 'Feedback' ? 'active' : ''}
            onClick={() => handleButtonClick('Feedback')}
          >
            Feedback
          </button>
        </div>
        {showFAQ && <FAQSection />}
        {showContactUs && <ContactUsPage />}
        {showFeedback && <FeedbackPage />}
      </div>
    </div>
  );
}

export default Helpandsupport;
