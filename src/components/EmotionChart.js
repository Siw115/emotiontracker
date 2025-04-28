// src/components/EmotionChart.js
import React from 'react';
import {Line} from 'react-chartjs-2';
import 'chart.js/auto';

const EmotionChart = ({ emotionData }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'top' },
        },
    };

    // Log the data structure passed to the chart
    console.log("Chart Data - Labels:", emotionData.labels);
    console.log("Chart Data - Datasets:", emotionData.datasets);

    return (
        <div className="chartContainer" style={{height: '400px', width: '100%'}}> {/* Set fixed height */}
            <h2>Emotion Frequency Over Time</h2>
            <Line data={emotionData} options={options}/>
        </div>
    );
};

export default EmotionChart;
