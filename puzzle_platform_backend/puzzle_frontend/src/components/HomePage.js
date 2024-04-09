import React, { useState, useEffect } from 'react';
import "./HomePage.css";
import Helpandsupport from "./HelpAndSupportPage";
import Wallet from "./SubscriptionPage";
import DashboardPage from "./DashbordPage";
import SettingsPage from './SettingsPage';
import TaskLevel from './TaskLevel';
import BalancePage from './BalancePage';

// Import icon library and icons
import { FaChartBar, FaTasks, FaQuestionCircle, FaWallet, FaRegAddressBook, FaCog } from 'react-icons/fa';

function HomePage() {
  const [activePage, setActivePage] = useState('Dashboard');

  useEffect(() => {
    // Check if there is an active page stored in local storage
    const storedPage = localStorage.getItem('activePage');
    if (storedPage) {
      setActivePage(storedPage);
    }
  }, []); // Empty dependency array to run only once on component mount

  const handlePageChange = (pageName) => {
    setActivePage(pageName);
  };

  const Navbar = () => {
    const pages = [
      { name: 'Dashboard', icon: <FaChartBar /> },
      { name: 'Task Level', icon: <FaTasks /> },
      { name: 'Help and Support', icon: <FaQuestionCircle /> },
      { name: 'Wallet', icon: <FaWallet /> },
      { name: 'Subscription', icon: <FaRegAddressBook /> },
      { name: 'Settings', icon: <FaCog /> }
    ];

    return (
      <div className="home-nav">
        <ul>
          {pages.map(page => (
            <li key={page.name} className={activePage === page.name ? 'active' : ''} onClick={() => handlePageChange(page.name)}>
              <span className="icon">{page.icon}</span>
              {page.name}
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
        return <BalancePage />;
      case 'Subscription':
        return <Wallet />;
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
