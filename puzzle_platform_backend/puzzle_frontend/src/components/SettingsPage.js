import React, { useState } from 'react';
import PersonalInformationPage from './PersonalInformationPage';
import SecurityPage from './SecurityPage';
import BillingAndTaxPage from './BillingAndTaxPage';
import "./SettingsPage.css";

const SettingsPage = () => {
  const [activeSetting, setActiveSetting] = useState('Personal Information');
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  const handleSettingChange = (settingName) => {
    setActiveSetting(settingName);
    setIsSaveEnabled(settingName === 'Personal Information' && !isEditingPersonalInfo);
  };

  const handleSave = () => {
    // Perform save operation or any other logic here
    localStorage.setItem('activePage', "Settings");
    // Refresh the page
    window.location.reload();
    
    // Set active setting back to 'Personal Information'
    setActiveSetting('Personal Information');
  };

  const handleCancel = () => {
    // Handle cancel logic if needed
    // setIsEditingPersonalInfo(false);
    // setIsSaveEnabled(false);
    console.log("cancle clicked!");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className='setting-text'>Manage your account settings</div>
        <div className="settings-buttons">
          <button className={`save-button ${!isSaveEnabled ? 'disabled' : ''}`} onClick={handleSave} disabled={!isSaveEnabled}>Save Changes</button>
          <button className={`cancel-button ${!isSaveEnabled ? 'disabled' : ''}`} onClick={handleCancel}>Cancel</button>
        </div>
      </div>
      <div className="settings-content">
        <ul className="settings-menu">
          <li className={activeSetting === 'Personal Information' ? 'active' : ''} onClick={() => handleSettingChange('Personal Information')}>Personal Information</li>
          <li className={activeSetting === 'Security' ? 'active' : ''} onClick={() => handleSettingChange('Security')}>Security</li>
          <li className={activeSetting === 'Billing History' ? 'active' : ''} onClick={() => handleSettingChange('Billing History')}>Billing History</li>
        </ul>
        <div className="settings-details">
          {activeSetting === 'Personal Information' && <PersonalInformationPage onEdit={() => setIsEditingPersonalInfo(true)} />}
          {activeSetting === 'Security' && <SecurityPage />}
          {activeSetting === 'Billing History' && <BillingAndTaxPage />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
