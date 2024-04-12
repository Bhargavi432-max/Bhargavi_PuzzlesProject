import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/JSFiles/Navbar";
import './App.css';
import { Login } from "./components/JSFiles/Login";
import { Register } from "./components/JSFiles/Register";
import OTPVerification from "./components/JSFiles/OTPVerification";
import ChangePassword from "./components/JSFiles/ChangePassword";
import ForgotPasswordPage from "./components/JSFiles/ForgotPasswordPage";
import CheckOTPPage from "./components/JSFiles/CheckOTPPage";
import ResetPasswordPage from "./components/JSFiles/ResetPasswordPage";
import PuzzlePage from "./components/JSFiles/PuzzlePage";
import { EmailProvider } from "./components/JSFiles/EmailContext";
import HomePage from "./components/JSFiles/HomePage";
import PaymentFailPage from "./components/JSFiles/PaymentFailPage";
import PaymentSuccessPage from "./components/JSFiles/PaymentSuccessPage";
import TwoStepOtp from "./components/JSFiles/TwoStepOtp";

function App() {
  return (
    <Router>
      <div className="App">
        <EmailProvider>
          <Navbar className='nav' /> {/* Include the Navbar component */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<OTPVerification />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
            <Route path="/checkotp" element={<CheckOTPPage />} />
            <Route path="/resetpassword" element={<ResetPasswordPage />} />
            <Route path="/puzzlepage" element={<PuzzlePage />} />
            <Route path ="/home" element={<HomePage/>} />
            <Route path="/fail" element={<PaymentFailPage />} />
            <Route path ="/success" element={<PaymentSuccessPage/>} />
            <Route path ="/twostepotp" element={<TwoStepOtp/>} />
          </Routes>
        </EmailProvider>
      </div>
    </Router>
  );
}

export default App;
