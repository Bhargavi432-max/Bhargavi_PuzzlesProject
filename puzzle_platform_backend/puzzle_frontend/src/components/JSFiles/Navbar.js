import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"; // Rename the imported Link as RouterLink
import "../CSSFiles/Navbar.css";
import Logo from "../Images/LogoSVS.png"; // Import your logo image here
import HomeBIcon from "../Images/HomeB.png";
import HomeWIcon from "../Images/HomeW.png"; // Import your custom home icon image here
import ProfileBIcon from "../Images/ProfileB.png";
import ProfileWIcon from "../Images/ProfileW.png";
import InfoB from "../Images/InfoB.png";
import InfoW from "../Images/InfoW.png";
import PuzzleB from "../Images/PuzzleB.png";
import PuzzleW from "../Images/PuzzleW.png";
import LogoutIcon from "../Images/Logout.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("selectedTask");
    localStorage.removeItem("puzzleData");
    localStorage.removeItem("selectedPuzzleDetails");
    localStorage.removeItem("selectedPuzzleDetails");
    localStorage.removeItem("rzp_device_id");
    localStorage.removeItem("rzp_checkout_anon_id");
    localStorage.removeItem("completedPuzzles");
    setActiveTab("");
    navigate("/");
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const renderNavItem = (tabName, inactiveIcon, activeIcon, text) => {
    const isActive = activeTab === tabName;
    const icon = isActive ? activeIcon : inactiveIcon;
    const buttonText = isActive ? text : null;

    return (
      <li key={tabName}>
        <RouterLink // Use RouterLink instead of Link
          to={`/${tabName}`}
          onClick={() => handleTabClick(tabName)}
        >
          <div className={`nav-item ${isActive ? "active" : ""}`}>
            <img src={icon} alt={text} />
            {buttonText}
          </div>
        </RouterLink>
      </li>
    );
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>
      <ul>
        {renderNavItem("home", HomeWIcon, HomeBIcon, "Home")}
        {renderNavItem("puzzlepage", PuzzleW, PuzzleB, "Puzzle")}
        <li>
          <div className="logout" onClick={handleLogout}>
            <img src={LogoutIcon} alt="Logout" />
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
