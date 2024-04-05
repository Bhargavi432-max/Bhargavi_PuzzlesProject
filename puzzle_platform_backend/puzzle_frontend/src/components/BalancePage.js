import React, { useState } from 'react';

const BalancePage = () => {
  const [balance, setBalance] = useState('');

  const handleSave = () => {
    // Add your save logic here
    console.log('Balance saved:', balance);
  };

  return (
    <div>
      <h1>Balance:</h1>
      <input
        type="text"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="Enter balance"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default BalancePage;
