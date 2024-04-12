import React, { useState } from "react";
//import "./PuzzlePages.css";

const PuzzlePage = () => {
  const puzzles = [];
  for (let index = 0; index < 25; index++) {
    puzzles.push({ id: index + 1 });
  }

  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [activeDifficultyBox, setActiveDifficultyBox] = useState(null);

  const handleSidebarButtonClick = (id) => {
    if (!selectedPuzzle || id === selectedPuzzle.id + 1 || id<selectedPuzzle.id) {
      setSelectedPuzzle({
        id: id,
      });
      setActiveDifficultyBox(null);
    } else {
      alert("Please click next task.");
    }
  };

  const handleDifficultyBoxButtonClick = async (id) => {
    const puzzle = Math.ceil(id / 45);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/handle_difficulty_box_button_click/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buttonid: id }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.image_path);

      setSelectedPuzzle({
        id: puzzle,
        imageUrl: data.image_path,
        videoUrl: data.video_path,
      });

      setActiveDifficultyBox(id);

      const buttons = document.querySelectorAll(".difficulty-buttons button");
      buttons.forEach((button) =>
        button.classList.remove("active-difficulty-button")
      );

      const clickedButton = document.getElementById(`button-${id}`);
      if (clickedButton) {
        clickedButton.classList.add("active-difficulty-button");
      }
    } catch (error) {
      console.error("Error fetching puzzle data", error);
    }
  };

  const renderDifficultyBoxButtons = (puzzleId, type) => {
    const buttons = [];
    for (let i = 1; i <= 15; i++) {
      const buttonId = i + (type - 1) * 15 + (puzzleId - 1) * 45;
      buttons.push(
        <button
          key={buttonId}
          id={`button-${buttonId}`}
          onClick={() => handleDifficultyBoxButtonClick(buttonId)}
          className={
            selectedPuzzle?.id === buttonId && activeDifficultyBox === buttonId
              ? "active active-difficulty-button"
              : ""
          }
        >
          1
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="puzzlepage">
      <div className="sidebar">
        {puzzles.map((puzzle) => (
          <button
            key={puzzle.id}
            onClick={() => handleSidebarButtonClick(puzzle.id)}
            className={selectedPuzzle?.id === puzzle.id ? "active" : ""}
          >
            {puzzle.id}
          </button>
        ))}
      </div>
      <div className="content">
        {selectedPuzzle && (
          <>
            <div className="difficulty-container">
              <div
                className="difficulty-box"
              >
                  <div className="difficulty-buttons">
                    {renderDifficultyBoxButtons(selectedPuzzle.id, 1)}
                  </div>
              </div>
              <div
                className="difficulty-box"
              >
                  <div className="difficulty-buttons">
                    {renderDifficultyBoxButtons(selectedPuzzle.id, 2)}
                  </div>
              </div>
              <div
                className="difficulty-box"
              >
                  <div className="difficulty-buttons">
                    {renderDifficultyBoxButtons(selectedPuzzle.id, 3)}
                  </div>
              </div>
            </div>
            <div className="puzzle">
              <div className="image-container">
                {selectedPuzzle.imageUrl ? (
                  <img
                    src={selectedPuzzle.imageUrl}
                    alt="imag"
                    className="puzzle-image"
                  />
                ) : (
                  <div className="nothing"></div>
                )}
              </div>
              <div className="video-container">
                {selectedPuzzle.videoUrl ? (
                  <video
                    key={selectedPuzzle.videoUrl}
                    title="Puzzle Video"
                    controls
                  >
                    <source src={selectedPuzzle.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <div className="nothing"></div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PuzzlePage;

