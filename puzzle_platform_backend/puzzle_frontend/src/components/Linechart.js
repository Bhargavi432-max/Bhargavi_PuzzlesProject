import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
} from 'chart.js';

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
);

function LineChart() {
    const [taskData, setTaskData] = useState(null); // State to store task data
    const email = localStorage.getItem("email");

    useEffect(() => {
        // Fetch data from backend
        fetch('http://127.0.0.1:8000/api/get_user_statistics/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // You can add any payload here if needed
            body: JSON.stringify({ 
                email:email,
            })
        })
        .then(response => response.json())
        .then(data => {
            // Once data is received, update state
            console.log(data);
            setTaskData(data);
        })
        .catch(error => {
            console.error('Error fetching task data:', error);
        });
    }, []); // Empty dependency array ensures the effect runs only once on component mount

    // Define chart data and options based on received task data
    const data = {
        labels: taskData ? Object.keys(taskData) : [],
        datasets: [{
            label: 'Completed Questions',
            data: taskData ? Object.values(taskData) : [],
            backgroundColor: 'aqua',
            borderColor: 'black',
            pointBorderColor: 'aqua',
            fill: true,
            tension: 0.4
        }]
    };

    const options = {
        plugins: {
            legend: true
        },
        scales: {
            y: {}
        }
    };

    return (
        <div className="Main">
            <h1>LINE Chart</h1>
            <div style={{ width: '600px', height: '800px' }}>
                {taskData ? (
                    <Line
                        data={data}
                        options={options}
                    />
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}

export default LineChart;
