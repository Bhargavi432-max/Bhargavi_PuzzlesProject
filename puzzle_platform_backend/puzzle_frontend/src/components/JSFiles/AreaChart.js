import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TimeTakenChart = ({ timeTakenData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Extracting time taken data
      const easyData = Object.values(timeTakenData.EASY);
      const mediumData = Object.values(timeTakenData.MEDIUM);
      const hardData = Object.values(timeTakenData.HARD);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1-10 sec', '11-20 min', '1-5 hrs', '5-10 hrs'],
          datasets: [
            {
              label: 'Easy',
              data: easyData,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 0.7)', 
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, 
            },
            {
              label: 'Medium',
              data: mediumData,
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 0.7)',
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, 
            },
            {
              label: 'Hard',
              data: hardData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 0.7)', 
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, 
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time Taken (in seconds)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time Interval'
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [timeTakenData]);

  return <canvas ref={chartRef} />;
};

export default TimeTakenChart;
