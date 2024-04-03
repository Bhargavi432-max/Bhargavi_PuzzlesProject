// BillingAndTaxPage.js
import React ,{useEffect} from 'react';

const BillingAndTaxPage = () => {
  useEffect(() => {
    // Fetch user information from the backend when the component mounts
    fetchbilldetails();
  }, []);

  const fetchbilldetails = async () => {
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
        console.log({data});
      } else {
        console.error('Failed to fetch user information:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };
  return (
    <div>
      <h2>Billing and Tax Page</h2>
    </div>
  );
};

export default BillingAndTaxPage;
