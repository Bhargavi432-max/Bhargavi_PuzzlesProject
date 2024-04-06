import React, { useState, useEffect } from "react";
import LockIcon from "./Images/Vector.png";
import "./Content.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionPopup from "./QuestionPopup.js";

const Content = ({ selectedTask, puzzleData }) => {
  // const [videoWatchCount, setVideoWatchCount] = useState(0);
  // const [puzzleButtonClickCount, setPuzzleButtonClickCount] = useState(0);
  const [puzzleCounts, setPuzzleCounts] = useState(puzzleData);
  const [isWatchedCompletely, setIsWatchedCompletely] = useState(false);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const navigate = useNavigate();
  const [selectedPuzzleDetails, setSelectedPuzzleDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [videoPath, setVideoPath] = useState(null); // State to hold video path
  const [key, setKey] = useState(0);
  const email = localStorage.getItem("email");
  const [startTime, setStartTime] = useState(null);
  const [nextPuzzleId, setNextPuzzleId] = useState(null);
  const [showQuestionPopup, setShowQuestionPopup] = useState(false); // State to manage whether to display the QuestionPopup
  // const [completedPuzzles, setCompletedPuzzles] = useState([]);
  const [isupdateskip, setisupdateskip] = useState(false);
  const [completedPuzzles, setCompletedPuzzles] = useState(() => {
    // Initialize completedPuzzles state with data from localStorage, if available
    const storedCompletedPuzzles = localStorage.getItem("completedPuzzles");
    return storedCompletedPuzzles ? JSON.parse(storedCompletedPuzzles) : [];
  });
  const [incompletedPuzzles, setIncompletedPuzzles] = useState(() => {
    // Initialize completedPuzzles state with data from localStorage, if available
    const storedIncompletedPuzzles = localStorage.getItem("incompletedPuzzles");
    return storedIncompletedPuzzles ? JSON.parse(storedIncompletedPuzzles) : [];
  });

  useEffect(() => {
    // Load puzzle details from local storage if available
    const storedPuzzleDetails = JSON.parse(
      localStorage.getItem("selectedPuzzleDetails")
    );
    if (
      storedPuzzleDetails &&
      storedPuzzleDetails.puzzle_id === selectedPuzzle?.puzzle_id
    ) {
      setSelectedPuzzleDetails(storedPuzzleDetails);
      const videoFileName = storedPuzzleDetails.data.video;
      const filePath = videoFileName;
      const filename = filePath.split("/").pop();
      const path = require("../videos/" + filename);
      setVideoPath(path);
    } else {
      setVideoPath(null); // Clear video path when new puzzle is selected
    }
  }, [selectedPuzzle]);

  useEffect(() => {
    // Update localStorage whenever completedPuzzles state changes
    localStorage.setItem("completedPuzzles", JSON.stringify(completedPuzzles));
  }, [completedPuzzles]);
  useEffect(() => {
    // Update localStorage whenever completedPuzzles state changes
    localStorage.setItem(
      "incompletedPuzzles",
      JSON.stringify(incompletedPuzzles)
    );
  }, [incompletedPuzzles]);
  useEffect(() => {
    localStorage.setItem("Puzzlecounts", JSON.stringify(puzzleCounts));
  }, [puzzleCounts]);
  useEffect(() => {
    if (puzzleData) {
      const initialCounts = {};
      puzzleData.forEach((puzzle) => {
          initialCounts[puzzle.puzzle_id] = {
              videoWatchCount: puzzle.video_count || 0,
              buttonClickCount: puzzle.puzzle_count || 0
          };
      });
      setPuzzleCounts(initialCounts);
    }
  }, [puzzleData]);

  useEffect(() => {
    if (nextPuzzleId) {
      const clickedPuzzle = puzzleData.find(
        (puzzle) => puzzle.puzzle_id === nextPuzzleId
      );
      fetch("http://127.0.0.1:8000/api/check_puzzle_locked/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          task_id: selectedTask ? selectedTask.id : null,
          puzzle_id: nextPuzzleId,
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
          console.log(data);
          if (data.status) {
            if (!data.puzzle_locked) {
              console.log("safdas");

              clickedPuzzle.puzzle_locked = false;
              console.log(clickedPuzzle);
              console.log(nextPuzzleId);
              handleDifficultyBoxButtonClick(nextPuzzleId);
            } else {
              setSelectedPuzzle(clickedPuzzle);
              setPopupMessage(
                "Puzzle is Locked.Please Upgrade your plan to access it"
              );
            }
          } else {
            setPopupMessage(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [nextPuzzleId]);

  const handleVideoMouseDown = (e) => {
    e.preventDefault();
  };

  const handleDifficultyBoxButtonClick = (puzzleId) => {
    console.log({puzzleCounts});
    const clickedPuzzle = puzzleData.find(
      (puzzle) => puzzle.puzzle_id === puzzleId
    );
    setisupdateskip(false);
    
    console.log("click:", clickedPuzzle);
    if (!clickedPuzzle.puzzle_locked) {
      setSelectedPuzzle(clickedPuzzle);
      localStorage.setItem("selectedPuzzle", JSON.stringify(clickedPuzzle));

      fetch("http://127.0.0.1:8000/api/get_puzzle_access/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          task_id: selectedTask ? selectedTask.id : null,
          puzzle_id: puzzleId,
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
          console.log(data.data);
          if (data.data) {
            setSelectedPuzzle(clickedPuzzle);
            setSelectedPuzzleDetails(data);
            localStorage.setItem("selectedPuzzleDetails", JSON.stringify(data));
            const videoFileName = data.data.video;
            const filePath = videoFileName;
            const filename = filePath.split("/").pop();
            const path = require("../videos/" + filename);
            setVideoPath(path);
            setKey((prevKey) => prevKey + 1);
            // setNextPuzzleId(data.next_puzzle_id); // Set the next puzzle id
           
          } else {
            setPopupMessage(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
        const currentPuzzleId = puzzleId;
        if (currentPuzzleId) {
          setPuzzleCounts((prevCounts) => ({
            ...prevCounts,
            [currentPuzzleId]: {
              ...prevCounts[currentPuzzleId],
              buttonClickCount: (prevCounts[currentPuzzleId]?.buttonClickCount || 0) + 1,
            },
          }));
        }
        const updatedCounts = {
          ...puzzleCounts,
          [puzzleId]: {
            ...puzzleCounts[puzzleId],
            buttonClickCount: (puzzleCounts[puzzleId]?.buttonClickCount || 0) + 1,
          },
        };
        setPuzzleCounts(updatedCounts);
    } else {
      setPopupMessage("Puzzle is Locked.Please Upgrade your plan to access it");
    }
  };

  const handleVideoSkip = async () => {
    if (!isWatchedCompletely && isVideoStarted) {
      const updatedIncompletedPuzzles = [
        ...incompletedPuzzles,
        selectedPuzzle.puzzle_id,
      ];
      setIncompletedPuzzles(updatedIncompletedPuzzles);
      // Save updated completedPuzzles to localStorage
      localStorage.setItem(
        "incompletedPuzzles",
        JSON.stringify(updatedIncompletedPuzzles)
      );
      console.log("Video skipped.");
      console.log(email, selectedPuzzle.puzzle_id, selectedTask.id);
      if (!isupdateskip) {
        setisupdateskip(true);
        selectedPuzzle.puzzle_status = "incompleted";
        const currentPuzzleId = selectedPuzzle.puzzle_id;
        console.log({puzzleCounts});
        await fetch("http://127.0.0.1:8000/api/mark_puzzle_status/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            task_id: selectedTask.id,
            puzzle_id: selectedPuzzle.puzzle_id,
            puzzle_status: "incompleted",
            time_spent: "00:00:00.000",
            video_count: puzzleCounts[currentPuzzleId]?.videoWatchCount || 0,
            puzzle_count: puzzleCounts[currentPuzzleId]?.buttonClickCount || 0,
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
            console.log(data); // Log the response from the backend
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };

  const handleVideoStart = () => {
    const currentDateTime = new Date();
    const startTime =
      currentDateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " " +
      currentDateTime.toLocaleTimeString("en-US", { hour12: false });
    setStartTime(startTime);
    setIsVideoStarted(true);
    const currentPuzzleId = selectedPuzzle?.puzzle_id;
    if (currentPuzzleId) {
      setPuzzleCounts((prevCounts) => ({
        ...prevCounts,
        [currentPuzzleId]: {
          ...prevCounts[currentPuzzleId],
          videoWatchCount: (prevCounts[currentPuzzleId]?.videoWatchCount || 0) + 1,
        },
      }));
    }
  };
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((val) => (val < 10 ? `0${val}` : val))
      .join(":");
  };
  const handleCloseQuestionPopup = () => {
    // Function to handle closing the QuestionPopup
    setShowQuestionPopup(false);
  };
  const handleVideoEnd = () => {
    setShowQuestionPopup(true);
    const currentDateTime = new Date();
    const endTime =
      currentDateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " " +
      currentDateTime.toLocaleTimeString("en-US", { hour12: false });
    // console.log(endTime)
    const elapsedTimeInSeconds =
      (currentDateTime.getTime() - new Date(startTime).getTime()) / 1000;
    const duration = formatDuration(elapsedTimeInSeconds);
    if (isVideoStarted) {
      setIsWatchedCompletely(true);
    }
    toast.success("Puzzle completed successfully !", { autoClose: 2000 });
    const puzzleStatus = "completed";
    const questionViewStatus = true;
    const videoViewStatus = true;
    const taskStatus = "incomplete";
    const actionItem = "puzzle completed";
    const updatedCompletedPuzzles = [
      ...completedPuzzles,
      selectedPuzzle.puzzle_id,
    ];
    setCompletedPuzzles(updatedCompletedPuzzles);
    // Save updated completedPuzzles to localStorage
    localStorage.setItem(
      "completedPuzzles",
      JSON.stringify(updatedCompletedPuzzles)
    );
    // Fetch request to mark puzzle status
    const currentPuzzleId = selectedPuzzle.puzzle_id;
    console.log({puzzleCounts});
    fetch("http://127.0.0.1:8000/api/mark_puzzle_status/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: selectedPuzzle.puzzle_id,
        puzzle_status: puzzleStatus,
        time_spent: duration,
        video_count: puzzleCounts[currentPuzzleId]?.videoWatchCount || 0,
        puzzle_count: puzzleCounts[currentPuzzleId]?.buttonClickCount || 0,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log({
            email,
            selectedTask,
            selectedPuzzle,
            puzzleStatus,
            duration,
          });
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log(data); // Log the response from the backend
        setNextPuzzleId(data.next_puzzle_id);
        if (nextPuzzleId) {
          handleDifficultyBoxButtonClick(nextPuzzleId);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Fetch request to log puzzle click
    fetch("http://127.0.0.1:8000/api/log_puzzle_click/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        task_id: selectedTask ? selectedTask.id : null,
        puzzle_id: selectedPuzzle.puzzle_id,
        question_view_status: questionViewStatus,
        video_view_status: videoViewStatus,
        puzzle_status: puzzleStatus,
        task_status: taskStatus,
        start_time: startTime,
        end_time: endTime,
        action_item: actionItem,
      }),
    })
      .then((response) => {
        console.log({
          email,
          selectedTask,
          selectedPuzzle,
          questionViewStatus,
          videoViewStatus,
          endTime,
          startTime,
        });
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log(data); // Log the response from the backend
        // Move to the next puzzle if the nextPuzzleId is set
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleVideoSeeking = (e) => {
    // Prevent seeking forward by setting the current time back to the previous time
    if (e.target.currentTime > e.target.seekable.start(0)) {
      e.target.currentTime = e.target.seekable.start(0);
    }
  };

  const renderDifficultyBoxButtons = () => {
    const easyPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "easy"
    );
    const mediumPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "medium"
    );
    const hardPuzzles = puzzleData.filter(
      (puzzle) => puzzle.level.toLowerCase() === "hard"
    );
    const renderButtons = (puzzles) => {
      const buttonRows = [];
      for (let i = 0; i < puzzles.length; i += 6) {
        const rowPuzzles = puzzles.slice(i, i + 6);
        const rowButtons = rowPuzzles.map((puzzle, index) => {
          let buttonClass = "difficulty-button";
          if (selectedPuzzle && selectedPuzzle.puzzle_id === puzzle.puzzle_id) {
            buttonClass += ` current-${puzzle.level && puzzle.level.toLowerCase()}`;
          } else {
            if (
              puzzle.user_status === "completed" ||
              completedPuzzles.includes(puzzle.puzzle_id)
            ) {
              buttonClass += ` completed-${puzzle.level && puzzle.level.toLowerCase()}`;
            } else if (
              puzzle.user_status === "incompleted" ||
              incompletedPuzzles.includes(puzzle.puzzle_id)
            ) {
              buttonClass += ` incompleted`;
            } else if (puzzle.user_status === "notstarted") {
              buttonClass += ` notstarted`;
            }
          }
          // If puzzle is locked, add lock icon below the button
          return (
            <div
              key={puzzle.id}
              className="button-container"
              style={{ position: "relative" }}
            >
              <button
                onClick={() => handleButtonClick(puzzle, i + index)} // Modified onClick handler
                className={buttonClass}
              >
                {i + index + 1}
              </button>
              {index === 0 && i === 0 && (
                <div className="tooltip-first-button">
                  {/* Render tooltip for the first button */}
                  <div className="tooltip-content">
                      <div>{puzzle.puzzle_name}</div>
                      <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                    </div>
                </div>
              )}
              {(index === 5 && i===0)  && (
                <div className="tooltip-last-button">
                  {/* Render tooltip for the first button */}
                  <div className="tooltip-content">
                    <div>{puzzle.puzzle_name}</div>
                    <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                  </div>
                </div>
              )}
              {(i === 0 && index !==0 && !((i + index + 1) % 6 === 0)) && (
                <div className="tooltips">
                  <div className="tooltips-content">
                    <div>{puzzle.puzzle_name}</div>
                    <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                  </div>
                </div>
              )}
              {(i !== 0 && index === 0) && (
                <div className="tooltip-right"> {/* Render tooltip to the right */}
                  <div className="tooltip-content">
                    <div>{puzzle.puzzle_name}</div>
                    <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                  </div>
                </div>
              )}
              { (i + index + 1) % 6 === 0 && (
                <div className="tooltip-left"> {/* Render tooltip to the left */}
                  <div className="tooltip-content">
                    <div>{puzzle.puzzle_name}</div>
                    <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                  </div>
                </div>
              )}
              {(i !== 0 && index !== 0 && !((i + index + 1) % 6 === 0)) && (
                <div className="tooltip"> {/* Render tooltip to the right */}
                  <div className="tooltip-content">
                    <div>{puzzle.puzzle_name}</div>
                    <div>Puzzle Count: {puzzleCounts[puzzle.puzzle_id]?.buttonClickCount || 0}</div>
                  </div>
                </div>
              )}
              {puzzle.puzzle_locked && (
                <img src={LockIcon} className="lock-icon" alt="Locked" />
              )}
            </div>
          );
        });
        buttonRows.push(
          <div key={`row-${i / 6}`} className="button-row">
            {rowButtons}
          </div>
        );
      }
      return buttonRows;
    };
    

    const handleButtonClick = (puzzle, buttonIndex) => {
      setSelectedPuzzle(puzzle);
      if (puzzle.puzzle_locked) {
        setPopupMessage(
          "This puzzle is locked!.please upgrade your plan or buy the puzzle"
        );
      } else {
        handleDifficultyBoxButtonClick(puzzle.puzzle_id, buttonIndex);
      }
    };
    return (
      <div className="difficulty-container">
        <div className="difficulty-box-container">
          <div className="difficulty-title">Easy Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(easyPuzzles)}
            </div>
          </div>
        </div>
        <div className="difficulty-box-container">
          <div className="difficulty-title">Medium Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(mediumPuzzles)}
            </div>
          </div>
        </div>
        <div className="difficulty-box-container">
          <div className="difficulty-title">Hard Level</div>
          <div className="difficulty-box shadow p-3 mb-5 bg-white rounded">
            <div className="difficulty-buttons">
              {renderButtons(hardPuzzles)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleClosePopup = () => {
    setPopupMessage(null);
    localStorage.setItem('activePage', "Wallet");
    navigate("/home");
   
  };
  const handlebuypuzzle = () => {
    console.log("details", email, selectedPuzzle.puzzle_id, selectedTask.id);
    fetch("http://127.0.0.1:8000/api/buy_puzzle/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        task_id: selectedTask.id,
        puzzle_id: selectedPuzzle.puzzle_id,
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
        console.log(data);
        if (data.status) {
          console.log(selectedPuzzle);
          selectedPuzzle.puzzle_locked = false;
          setPopupMessage(null);
          setSelectedPuzzle(null);
          setSelectedPuzzleDetails(null);
          console.log("enter");
          navigate("/puzzlepage");
          handleDifficultyBoxButtonClick(selectedPuzzle.puzzle_id);
        } else {
          setPopupMessage(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleCloseit = () => {
    setPopupMessage(null);
    setSelectedPuzzle(null);
    setSelectedPuzzleDetails(null);
    navigate("/puzzlepage");
  };

  const renderPopup = () => {
    if (popupMessage) {
      return (
        <div className="popup-container">
          <div className="popup">
            <button className="close-popup" onClick={handleCloseit}>
              X
            </button>
            <div className="popup-content">
              <p className="pop-text">{popupMessage}</p>
              <button className="close-button" onClick={handleClosePopup}>
                Subscribe
              </button>
              <p>or</p>
              <button className="buy-button" onClick={handlebuypuzzle}>
                Buy Puzzle
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPuzzleDetails = () => {
    if (!selectedPuzzleDetails || !selectedPuzzleDetails.data) {
      return null;
    }

    const { question } = selectedPuzzleDetails.data;

    if (!question || !videoPath) {
      return <p>No data found for this puzzle</p>;
    }
    const puzzle_id_get_it = () => {
      const puzzle_data_need = JSON.parse(
        localStorage.getItem("selectedPuzzle")
      );
      console.log(puzzle_data_need);
      return puzzle_data_need.puzzle_id;
    };

    return (
      <div className="puzzle-details">
        <div className="question-container">
          <div className="header-container">
            <h2 className="question-Name">Puzzle No: {puzzle_id_get_it()}</h2>
            <b>
              <h2 className="questions-code">
                Interview No: {selectedPuzzleDetails.data.interview_code}
              </h2>
            </b>
          </div>
          <div className="question-Box">
            <div className="question-heading">
              {selectedPuzzleDetails.data.puzzle_name}
            </div>
            <div className="question-content">
              <div className="question-question">
                {selectedPuzzleDetails.data.question}
              </div>
              <div className="question-code">
                {selectedPuzzleDetails.data.code.split('\n').map((statement, index) => (
                  <div key={index}>{statement.trim()}{index < selectedPuzzleDetails.data.code.split(',').length - 1 && ','}</div>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="video-container" key={key}>
          <video
            controls
            controlsList="nodownload noremoteplayback"
            disableRemotePlayback
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={handleVideoMouseDown}
            onEnded={handleVideoEnd}
            onTimeUpdate={handleVideoSkip}
            onPlay={handleVideoStart}
            onSeeking={handleVideoSeeking}
            className="react-player"
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      </div>
    );
  };

  return (
    <div className="contents">
      {renderPopup()}
      {selectedTask && renderDifficultyBoxButtons()}
      {renderPuzzleDetails()}
      {showQuestionPopup && ( // Render QuestionPopup if showQuestionPopup is true
        <QuestionPopup
          email={email}
          puzzleId={selectedPuzzle.puzzle_id}
          taskId={selectedTask ? selectedTask.id : null}
          onClose={handleCloseQuestionPopup}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Content;
