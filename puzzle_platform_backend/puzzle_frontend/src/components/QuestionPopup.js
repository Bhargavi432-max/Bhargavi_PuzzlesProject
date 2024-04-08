import React, { useState, useEffect } from "react";
import "./QuestionPopup.css";

const QuestionPopup = ({ email, puzzleId, taskId, onClose }) => {
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null);

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
        setQuestionData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [email, puzzleId, taskId]);

  const handleOptionSelect = (selectedOption) => {
    // Handle selected option
    setSelectedOption(selectedOption);
    setNextButtonEnabled(true);
  };

  const handleNextButtonClick = () => {
    // Check if the selected option is correct
    const isCorrect = selectedOption === questionData.correct_answer;
    setAnswerStatus(isCorrect ? "correct" : "incorrect");
  };
  const handleContinueButtonClick = () => {
    // Handle continue button click
    // You can navigate to the next puzzle here
    console.log("redirectiong to....");
    onClose(); 
  };

  return (
    <>
      <div className="question-popup-background" />
      <div className="question-popup">
        {answerStatus ? (
          <div className="answer-status">
            <div className="header-question">
              <h2 className="question-header-text">Answer to the Question</h2>
            </div>
            <p className="result-text">
              {answerStatus === "correct"
                ? "You answered correctly, so we are redirecting to the next puzzle."
                : "You answered wrongly, so we are redirecting to the task."}
            </p>
            <button className="continue-button" onClick={handleContinueButtonClick}>
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="header-question">
              <h2 className="question-header-text">Answer to the Question</h2>
            </div>
            <h2 className="question-text">{questionData?.puzzle_question}</h2>
            <div className="options">
              {questionData?.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {nextButtonEnabled && (
              <button className="next-button" onClick={handleNextButtonClick}>
                Next
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default QuestionPopup;
