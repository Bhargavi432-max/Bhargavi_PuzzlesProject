import React, { useEffect, useState } from "react";
import SinglePercentagePieChart from "./UserStatistics";
import LineChart from "./Linechart";
import TaskLevelPage from "./OverallPie";
import "./DashbordPage.css"; // Import CSS for styling
import RingPieChart from "./TimespentChart";
import def from "./defualtImage.jpg";
import { FaUser, FaGraduationCap, FaUniversity } from "react-icons/fa";
import Logo from "./Images/LogoSVS.png";

const DashboardPage = () => {
  const [responseData, setResponseData] = useState(null); // State for response data
  const email = localStorage.getItem("email"); // Example email, replace with actual email
  const [imagepath, setImagePath] = useState(null);
  useEffect(() => {
    // Fetch user data and subscription plans when component mounts
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/get_user_statistics/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setResponseData(data);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [email]);
  const fetchUserInfo = async () => {
    const email = localStorage.getItem('email');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_user_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        console.log({data});
        const userData = data.user_data;
        const imageFileName = userData.profile_image;
        if (imageFileName) {
          const filePath = imageFileName;
          const filename = filePath.split("/").pop();
          const path = require("../profile_image/" + filename);
          setImagePath(path);
        } else {
          // Set default image path if no image is provided
          setImagePath(def);
        }
      } else {
        console.error('Failed to fetch user information:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="user-rank-container">
        <div className="user-details-container">
            <div className="prof-images">
              <img className="prof-Dash" src={imagepath || def} alt="ProfileImage" />
            </div>
          <div className="user-details">
            <div className="dashboard-username">
              <FaUser className="icon" />{" "}
              {responseData?.user_statistics.username}
            </div>
            <div className="user-branch">
              <FaGraduationCap className="icon" />
              {responseData?.user_statistics.education}
            </div>
            <div className="user-clg">
              <FaUniversity className="icon" />{" "}
              {responseData?.user_statistics.college_name}
            </div>
          </div>
        </div>
        <div className="rank-container">
          <div className="rank-details">
            <img src={Logo} alt="Rank" style={{width:"200px",height:"80px" , padding:"20px"}}></img>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="box-structure">
          <SinglePercentagePieChart
            completedPercentage={
              responseData?.user_statistics.completed_puzzles
            }
            incompletedPercentage={
              responseData?.user_statistics.incompleted_puzzles
            }
            notStartedPercentage={
              responseData?.user_statistics.notstarted_puzzles
            }
            style={{ marginright: "10px" }}
          />
        </div>
        <LineChart
          className="linechart"
          userStatistics={responseData?.user_statistics}
          style={{ marginright: "10px" }}
        />
        {responseData && responseData.user_statistics && (
          <div className="side-container" style={{ marginleft: "10px" }}>
            <RingPieChart
              className="ringpiechart"
              totalTimeSpent={responseData.user_statistics.total_time_spent}
            />
            <TaskLevelPage
              percentageCompletedByLevel={
                responseData?.user_statistics.percentage_completed_by_level
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
