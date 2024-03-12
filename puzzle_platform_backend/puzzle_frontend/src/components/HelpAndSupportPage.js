// Helpandsupport.js
import React, { useState } from 'react';
import './HelpAndSupportPAge.css';
import FAQSection from "./FAQsPage";

function Helpandsupport() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setShowFAQ(buttonName === 'FAQs');
    setActiveButton(buttonName);
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
      </div>
    </div>
  );
}

export default Helpandsupport;
