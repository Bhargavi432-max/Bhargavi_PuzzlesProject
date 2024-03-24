// PaymentSuccessPage.jsx

import React, { useEffect } from "react";

const PaymentSuccessPage = () => {
  useEffect(() => {
    localStorage.removeItem("puzzleData");
  }, []);
  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your Subscribing!</p>
    </div>
  );
};

export default PaymentSuccessPage;
