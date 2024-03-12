import React, { useState } from 'react';
import './HelpAndSupportPAge.css';
import FAQSection from "./FAQsPage";
import ContactUsPage from "./ContactUsPage";

function Helpandsupport() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName === 'FAQs') {
      setShowFAQ(true);
      setShowContactUs(false);
    } else if (buttonName === 'Contact Us') {
      setShowFAQ(false);
      setShowContactUs(true);
    } else {
      setShowFAQ(false);
      setShowContactUs(false);
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
      </div>
    </div>
  );
}

export default Helpandsupport;
