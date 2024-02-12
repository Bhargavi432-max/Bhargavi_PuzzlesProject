import React from "react";

const Content = ({
  selectedPuzzle,
  renderDifficultyBoxButtons,
  handleDifficultyBoxButtonClick,
}) => {
  return (
    <div className="content">
      {selectedPuzzle && (
        <>
          <div className="difficulty-container">
            <div className="difficulty-box">
              <h3>Easy</h3>
              <div className="difficulty-buttons">
                {renderDifficultyBoxButtons(selectedPuzzle.id, 1, handleDifficultyBoxButtonClick)}
              </div>
            </div>
            <div className="difficulty-box">
              <h3>Medium</h3>
              <div className="difficulty-buttons">
                {renderDifficultyBoxButtons(selectedPuzzle.id, 2, handleDifficultyBoxButtonClick)}
              </div>
            </div>
            <div className="difficulty-box">
              <h3>Hard</h3>
              <div className="difficulty-buttons">
                {renderDifficultyBoxButtons(selectedPuzzle.id, 3, handleDifficultyBoxButtonClick)}
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
  );
};

export default Content;
