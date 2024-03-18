import React from 'react';
import SinglePercentagePieChart from './UserStatistics';
import LineChart from './Linechart';
import TaskLevelPage from './OverallPie';
import './DashbordPage.css'; // Import CSS for styling

const DashboardPage = () => {
 return (
    <div className="dashboard-page">
      <div className="content">
        <div className="pie-container">
          <div className="box-structure">
            <SinglePercentagePieChart percentage={75} />
          </div>
        </div>
        <LineChart className="linechart" />
        <TaskLevelPage className="tasklevel" />
      </div>
    </div>
  );
};

export default DashboardPage;
