import React, { useEffect, useState } from "react";
import SinglePercentagePieChart from "./UserStatistics";
import LineChart from "./Linechart";
import TaskLevelPage from "./OverallPie";
import "./DashbordPage.css"; // Import CSS for styling
import RingPieChart from "./TimespentChart";
import Profile from "./Images/Profile photo.svg";

const DashboardPage = () => {
  const [responseData, setResponseData] = useState(null); // State for response data
  const email = localStorage.getItem("email"); // Example email, replace with actual email

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
  
  return (
    <div className="dashboard-page">
      <div className="user-rank-container">
        <div className="user-details-container">
          <div className="profile-image">
            <img src={Profile} alt="profile" className="prof-pic"></img>
          </div>
          <div className="user-details">
            <div className="user-name">Leo Stanton</div>
            <div className="user-branch">B.E computer science</div>
            <div className="user-clg">SRM institute of science and technology</div>
          </div>
        </div>
        <div className="rank-container">
          rankcontainer
        </div>
      </div>
      <div className="content">
        <div className="box-structure">
          <SinglePercentagePieChart percentage={75} />
        </div>
        <LineChart className="linechart" userStatistics={responseData?.user_statistics} />
        {responseData && responseData.user_statistics && (
          <div className="side-container">
            <RingPieChart className="ringpiechart" totalTimeSpent={responseData.user_statistics.total_time_spent} />
            <TaskLevelPage className="tasklevel" percentageCompletedByLevel={responseData?.user_statistics?.percentage_completed_by_level} style={{ marginTop: "20px" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
