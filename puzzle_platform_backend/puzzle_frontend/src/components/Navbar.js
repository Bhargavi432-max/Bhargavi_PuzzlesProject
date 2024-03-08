import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 
import Logo from "./Images/LogoSVS.png"; // Import your logo image here
import HomeIcon from "./Images/Homeicon.png"; // Import your custom home icon image here
import ProfileIcon from "./Images/Profileicon.png"; // Import your custom profile icon image here
import AboutIcon from "./Images/Infoicon.png"; 
import PuzzleIcon from "./Images/Puzzleicon.png";

const Navbar = () => {
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
        
      </ul>
    </nav>
  );
};

export default Navbar;
