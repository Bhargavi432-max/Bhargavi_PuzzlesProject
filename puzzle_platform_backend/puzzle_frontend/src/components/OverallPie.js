import React from "react";
import "./OverallPie.css";

const TaskLevelPage = ({ percentageCompletedByLevel }) => {
  return (
    <div className="container">
      <div className="container-box">
        <div className="text-pie">High Score</div>
        <div className="big-text">Difficulty Level</div>
        <div className="circle" id="greenCircle">
          {percentageCompletedByLevel && percentageCompletedByLevel.HARD}%
        </div>
        <div className="circle" id="yellowCircle">
          {percentageCompletedByLevel && percentageCompletedByLevel.MEDIUM}%
        </div>
        <div className="circle" id="purpleCircle">
          {percentageCompletedByLevel && percentageCompletedByLevel.EASY}%
        </div>
      </div>
    </div>
  );
};

export default TaskLevelPage;
