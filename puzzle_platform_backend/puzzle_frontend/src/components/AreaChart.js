import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TimeTakenChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Example data
      const data = {
        easy: [0, 10, 30, 60], // Time taken for easy mode
        medium: [0, 25, 40, 80], // Time taken for medium mode
        hard: [0, 50, 70, 120] // Time taken for hard mode
      };

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
              data: data.easy,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 0.7)', // Changed border color
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, // Hide points
            },
            {
              label: 'Medium',
              data: data.medium,
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 0.7)', // Changed border color
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, // Hide points
            },
            {
              label: 'Hard',
              data: data.hard,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 0.7)', // Changed border color
              borderWidth: 0,
              fill: 'origin',
              pointRadius: 0, // Hide points
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time Taken (in minutes)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Difficulty Level'
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
  }, []);

  return <canvas ref={chartRef} />;
};

export default TimeTakenChart;
