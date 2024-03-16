import React from "react";
import "./OverallPie.css";

const TaskLevelPage = () => {
  return (
    <div className="container">
        <div className="text-pie">High Score</div>
        <div className="big-text">Difficulty Level</div>
        <div className="circle" id="greenCircle">
            60%
        </div>
        <div className="circle" id="yellowCircle">
            30%
        </div>
        <div className="circle" id="purpleCircle">
            80%
        </div>
    </div>
  );
};

export default TaskLevelPage;