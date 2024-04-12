import React, { useState } from 'react';
import '../CSSFiles/InfoPage.css';

function InfoPage() {
  const [activePage, setActivePage] = useState('Dashboard');

  const handlePageChange = (pageName) => {
    setActivePage(pageName);
  };

  const Navbar = () => {
    const pages = ['Dashboard', 'Task Level', 'My Task', 'Help and Support', 'Wallet', 'Settings', 'Sign Out'];

    return (
      <div className="navbar">
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
        return <div>Dashboard Page</div>;
      case 'Task Level':
        return <div>Task Level Page</div>;
      case 'My Task':
        return <div>My Task Page</div>;
      case 'Help and Support':
        return <div>Help and Support Page</div>;
      case 'Wallet':
        return <div>Wallet Page</div>;
      case 'Settings':
        return <div>Settings Page</div>;
      case 'Sign Out':
        return <div>Sign Out Page</div>;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <PageContent />
      </div>
    </div>
  );
}

export default InfoPage;
