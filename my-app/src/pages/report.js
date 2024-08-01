
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Report = () => {
    const [data, setData] = useState(null);
    const [summary, getSummary] = useState(null)

    useEffect(() => {
        // Fetch data from the backend
        axios.get('http://localhost:3001/report')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the report!", error);
            });
        axios.get('http://localhost:3001/summarize')
            .then(response => {
                getSummary(response.data.summary);
            })
            .catch(error =>{
            console.error("There was an error summarizing the report!", error);
            })
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Report</h2>
            <p>User Name: {data.userName}  Date: {data.date}</p>
            <div>
                <h3>Browsing Summary</h3>
                <ul>
                    <li>Total Courses Browsed: {data.totalCoursesBrowsed}</li>
                    <li>Courses Marked as Interested: {data.coursesMarkedAsInterested}</li>
                    <li>Courses Marked as Disinterested: {data.coursesMarkedAsDisinterested}</li>
                </ul>
            </div>
            <div>
                <h3>Detailed Interaction</h3>
                <h4>Interested Courses</h4>
                {data.interestedCourses.map((course, index) => (
                    <div key={index}>
                        <h5>{index + 1}. {course.title}</h5>
                    </div>
                ))}
                <h4>Disinterested Courses</h4>
                {data.disinterestedCourses.map((course, index) => (
                    <div key={index}>
                        <h5>{index + 1}. {course.title}</h5>
                    </div>
                ))}
                <h4>Summary</h4>
                    <div>
                        <p>{summary}</p>
                    </div>
            </div>
        </div>
    );
};

export default Report;
