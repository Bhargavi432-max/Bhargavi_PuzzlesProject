import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; 
import Logo from "./Images/LogoSVS.png"; // Import your logo image here
import HomeIcon from "./Images/Homeicon.png"; // Import your custom home icon image here
import ProfileIcon from "./Images/Profileicon.png"; // Import your custom profile icon image here
import AboutIcon from "./Images/Infoicon.png"; 
import PuzzleIcon from "./Images/Puzzleicon.png";
import LogoutIcon from"./Images/Logout.png";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("selectedTask");
    localStorage.removeItem("puzzleData");
    localStorage.removeItem("selectedPuzzleDetails");
    localStorage.removeItem("selectedPuzzleDetails");
    localStorage.removeItem("rzp_device_id");
    localStorage.removeItem("rzp_checkout_anon_id");
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>
      <ul>
        <li>
          <Link to="/home">
            <img src={HomeIcon} alt="Home" style={{ width: '86.03px', height: '36.64px' }}/>
          </Link>
        </li>
        <li>
          <Link to="/puzzlepage">
            <img src={PuzzleIcon} alt="puzzle" />
          </Link>
        </li>
        <li>
          <Link to="/about">
            <img src={AboutIcon} alt="About" />
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <img src={ProfileIcon} alt="Profile" />
          </Link>
        </li>
        <li>
          <div className="logout" onClick={handleLogout}>
            <img src={LogoutIcon} alt="logout" />
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
