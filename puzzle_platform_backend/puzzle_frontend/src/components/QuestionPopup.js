import React, { useState, useEffect } from "react";

const QuestionPopup = ({ email, puzzleId, taskId, onClose }) => {
  const [questionData, setQuestionData] = useState(null);
  console.log("question:",{email,puzzleId,taskId});
  useEffect(() => {
    // Fetch question and options data
    fetch("http://127.0.0.1:8000/api/get_puzzle_question/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        puzzle_id: puzzleId,
        task_id: taskId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log({data});
        setQuestionData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [email, puzzleId, taskId]);

  const handleOptionSelect = (selectedOption) => {
    // Handle selected option
    // You can make another POST request to submit the selected option, if needed
    console.log("Selected Option:", selectedOption);
    onClose(); // Close the popup
  };

  return (
    <div className="question-popup">
      {questionData && (
        <>
          <h2>{questionData.question}</h2>
          <div className="options">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionPopup;
