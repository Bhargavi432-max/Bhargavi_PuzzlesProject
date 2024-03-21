import React from "react";
import "./OverallPie.css";
//import { Pie } from "react-chartjs-2";



const TaskLevelPage = () => {
  return (
    <div className="container">
      <div className="container-box">
        <div className="text-pie">High Score</div>
        <div className="big-text">Difficulty Level</div>
        <div className="circle" id="greenCircle">
          80%
        </div>
        <div className="circle" id="yellowCircle">
          40%
        </div>
        <div className="circle" id="purpleCircle">
          10%
        </div>
      </div>
    </div>
  );
};

export default TaskLevelPage;
