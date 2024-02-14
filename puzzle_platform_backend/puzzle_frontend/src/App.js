import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import OTPVerification from "./components/OTPVerification";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OTPVerification />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
