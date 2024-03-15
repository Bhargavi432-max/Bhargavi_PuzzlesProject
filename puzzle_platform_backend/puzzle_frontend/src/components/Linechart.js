import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Importing 'Chart' as 'default' from 'chart.js/auto'

const AreaChart = () => {
  const chartRef = useRef();

  useEffect(() => {
    const data = [
      { task: "Task 1", completedQuestions: 5 },
      { task: "Task 2", completedQuestions: 8 },
      { task: "Task 3", completedQuestions: 3 },
      { task: "Task 4", completedQuestions: 10 },
      { task: "Task 5", completedQuestions: 6 },
    ];

    const labels = data.map((item) => item.task);
    const values = data.map((item) => item.completedQuestions);

    const chart = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Completed Questions",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, []);

  return <canvas ref={chartRef} />;
};

export default AreaChart;
