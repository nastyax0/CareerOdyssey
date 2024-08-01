import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import httpClient from '../httpClient';
import { UserContext } from '../UserContext';


const LikedCourses = () => {
  const [likedCourses, setLikedCourses] = useState([]);
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
    fetchLikedCourses();
  }, []);

  const fetchLikedCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get_liked_course', {
        params: { user_id: user.id },
      });
      setLikedCourses(response.data.liked_courses);
    } catch (error) {
      console.error('Error fetching liked courses:', error);
    }
  };

  return (
    <div>
      <h1>Liked Courses</h1>
      <ul>
        {likedCourses.map(courseId => (
          <li key={courseId}>{courseId}</li>
        ))}
      </ul>
    </div>
  );
};

export default LikedCourses;
