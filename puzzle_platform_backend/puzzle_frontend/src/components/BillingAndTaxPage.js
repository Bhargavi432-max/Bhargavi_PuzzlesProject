import React, { useEffect, useState } from 'react';
import './BillingAndTaxPage.css'; // Import the CSS file for styling

const BillingAndTaxPage = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchBillDetails();
  }, []);

  const fetchBillDetails = async () => {
    const email = localStorage.getItem('email');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_payment_history/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setPaymentHistory(data.payment_history);
      } else {
        console.error('Failed to fetch payment history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  return (
    <div>
      <h2>Billing History</h2>
      <div className="table-container"> {/* Wrap the table in a container */}
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Transaction ID</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((payment, index) => (
              <tr key={index}>
                <td>{payment.date}</td>
                <td>{payment.action}</td>
                <td>{payment.transaction_id}</td>
                <td>{payment.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingAndTaxPage;
