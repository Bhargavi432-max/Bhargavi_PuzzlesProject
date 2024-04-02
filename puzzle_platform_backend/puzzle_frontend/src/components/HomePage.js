// HomePage.js
import React, { useState } from 'react';
import "./HomePage.css";
import Helpandsupport from "./HelpAndSupportPage";
import Wallet from "./SubscriptionPage";
import DashboardPage from "./DashbordPage";
import SettingsPage from './SettingsPage';
import TaskLevel from './TaskLevel';

function HomePage( ) {
  const [activePage, setActivePage] = useState('Wallet');

  const handlePageChange = (pageName) => {
    setActivePage(pageName);
  };

  const Navbar = () => {
    const pages = ['Dashboard', 'Task Level', 'Help and Support', 'Wallet', 'Settings'];

    return (
      <div className="home-nav">
        <ul>
          {pages.map(page => (
            <li key={page} className={activePage === page ? 'active' : ''} onClick={() => handlePageChange(page)}>
              {page}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const PageContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Task Level':
        return <TaskLevel />;
      case 'Help and Support':
        return <Helpandsupport />;
      case 'Wallet':
        return  <Wallet />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="nav-home">
      <Navbar />
      <div className="content-home">
        <PageContent />
      </div>
    </div>
  );
}

export default HomePage;
