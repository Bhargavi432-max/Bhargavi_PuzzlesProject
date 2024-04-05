// SettingsPage.js
import React, { useState } from 'react';
import PersonalInformationPage from './PersonalInformationPage';
import SecurityPage from './SecurityPage';
import BillingAndTaxPage from './BillingAndTaxPage';
import "./SettingsPage.css";

const SettingsPage = () => {
  const [activeSetting, setActiveSetting] = useState('Personal Information');

  const handleSettingChange = (settingName) => {
    setActiveSetting(settingName);
  };
  const handleSave = () => {
    // Perform save operation or any other logic here
    
    // Refresh the page
    window.location.reload();
    
    // Set active setting back to 'Personal Information'
    setActiveSetting('Personal Information');
  };
  

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className='setting-text'>Manage your account settings</div>
        <div className="settings-buttons">
          <button className="save-button" onClick={handleSave}>Save Changes</button>
          <button className="cancel-button">Cancel</button>
        </div>
      </div>
      <div className="settings-content">
        <ul className="settings-menu">
          <li className={activeSetting === 'Personal Information' ? 'active' : ''} onClick={() => handleSettingChange('Personal Information')}>Personal Information</li>
          <li className={activeSetting === 'Security' ? 'active' : ''} onClick={() => handleSettingChange('Security')}>Security</li>
          <li className={activeSetting === 'Billing and Tax' ? 'active' : ''} onClick={() => handleSettingChange('Billing and Tax')}>Billing and Tax</li>
        </ul>
        <div className="settings-details">
          {activeSetting === 'Personal Information' && <PersonalInformationPage />}
          {activeSetting === 'Security' && <SecurityPage />}
          {activeSetting === 'Billing and Tax' && <BillingAndTaxPage />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
