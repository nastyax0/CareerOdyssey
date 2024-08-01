import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import httpClient from '../httpClient';

import { UserContext } from '../UserContext';


const DislikedCourses = () => {
  const [dislikedCourses, setDislikedCourses] = useState([]);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("http://localhost:3001/check_user");
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, [setUser]);
  useEffect(() => {
    fetchDislikedCourses();
  }, []);

  const fetchDislikedCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get_disliked_courses', {
        params: { user_id: user.id },
      });
      setDislikedCourses(response.data.disliked_courses);
    } catch (error) {
      console.error('Error fetching disliked courses:', error);
    }
  };

  return (
    <div>
      <h1>Disliked Courses</h1>
      <ul>
        {dislikedCourses.map(courseId => (
          <li key={courseId}>{courseId}</li>
        ))}
      </ul>
    </div>
  );
};

export default DislikedCourses;
