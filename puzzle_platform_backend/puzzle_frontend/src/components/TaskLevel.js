import React, { useState, useEffect } from 'react';

function TaskLevel() {
  const [responseData, setResponseData] = useState(null);
  const email = localStorage.getItem('email');

  const handleClick = async (taskId) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_user_taskwise_statistics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          task_id: taskId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResponseData(data);
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    console.log("Response Data:", responseData);
  }, [responseData]);

  return (
    <div>
      <div>TaskLevel</div>
      <div style={{ display: 'flex' }}>
        {[...Array(25)].map((_, index) => (
          <button key={index} onClick={() => handleClick(index + 1)}>Task {index + 1}</button>
        ))}
      </div>
      <div>
        <h2>Response Data</h2>
        {responseData ? (
        <>
          <p>Completed Puzzles: {responseData.user_statistics.completed_puzzles}</p>
          <p>Incompleted Puzzles: {responseData.user_statistics.incompleted_puzzles}</p>
          <p>Not Started Puzzles: {responseData.user_statistics.notstarted_puzzles}</p>
          <h3>Completed Puzzles by Level:</h3>
          <p>Easy: {responseData.user_statistics.completed_puzzles_by_level.EASY}</p>
          <p>Medium: {responseData.user_statistics.completed_puzzles_by_level.MEDIUM}</p>
          <p>Hard: {responseData.user_statistics.completed_puzzles_by_level.HARD}</p>
          <h3>Time Taken:</h3>
          <p>Easy: {responseData.user_statistics.time_taken.EASY.hours} hours, {responseData.user_statistics.time_taken.EASY.minutes} minutes, {responseData.user_statistics.time_taken.EASY.seconds} seconds</p>
          <p>Medium: {responseData.user_statistics.time_taken.MEDIUM.hours} hours, {responseData.user_statistics.time_taken.MEDIUM.minutes} minutes, {responseData.user_statistics.time_taken.MEDIUM.seconds} seconds</p>
          <p>Hard: {responseData.user_statistics.time_taken.HARD.hours} hours, {responseData.user_statistics.time_taken.HARD.minutes} minutes, {responseData.user_statistics.time_taken.HARD.seconds} seconds</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
      </div>
    </div>
  );
}

export default TaskLevel;
