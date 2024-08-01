import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import httpClient from '../httpClient';

const SearchCourses = () => {
  const { user, setUser } = useContext(UserContext); // Correctly use UserContext
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ youtube: { items: [] }, coursera: { elements: [] }, udemy: [] });
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [likedCourses, setLikedCourses] = useState([]);
  const [dislikedCourses, setDislikedCourses] = useState([]);
  const [toDoList, setToDoList] = useState([]); // State for to-do list
  const [deadline, setDeadline] = useState([]);

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

  const searchCourses = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('http://localhost:5000/search_courses', { params: { query } });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedCourses = async () => {
    if (!user) return;
    try {
      const response = await axios.get('http://localhost:3001/get_liked_courses', {
        params: { user_id: user.id },
      });
      setLikedCourses(response.data.liked_courses);
    } catch (error) {
      console.error('Error fetching liked courses:', error);
    }
  };

  const fetchDislikedCourses = async () => {
    if (!user) return;
    try {
      const response = await axios.get('http://localhost:3001/get_disliked_courses', {
        params: { user_id: user.id },
      });
      setDislikedCourses(response.data.disliked_courses);
    } catch (error) {
      console.error('Error fetching disliked courses:', error);
    }
  };

  const likeCourse = async (courseId) => {
    if (!user) return;
    try {
      await axios.post('http://localhost:3001/like_course', {
        user_id: user.id,
        course_id: courseId,
        liked: true,
      });
    } catch (error) {
      console.error('Error liking course:', error);
    }
  };

  const dislikeCourse = async (courseId) => {
    if (!user) return;
    try {
      await axios.post('http://localhost:3001/dislike_course', {
        user_id: user.id,
        course_id: courseId,
        liked: false,
      });
    } catch (error) {
      console.error('Error disliking course:', error);
    }
  };

  const scrapeCourse = async (courseUrl) => {
    try {
      const response = await httpClient.post('http://localhost:5000/scrape_course', { url: courseUrl });
      setScrapedData(response.data.data);
    } catch (error) {
      console.error('Error initiating scrape:', error);
    }
  };

  const addToDo = async (courseId, courseTitle) => {
    if (!user) return;
    try {
        await axios.post('http://localhost:3001/todo', {
            course_id: courseId,
            course_title: courseTitle,
            user_id: user.id, // Assuming `user.id` contains the current user's ID
            deadline: deadline
        });
    } catch (error) {
        console.error('Error adding todo:', error);
    }
};
  const removeFromToDo = (courseId) => {
    setToDoList(toDoList.filter(course => course.id !== courseId));
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for courses"
          />
          <button onClick={searchCourses} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <div>
            <h2>YouTube Results</h2>
            <ul>
              {results.youtube && results.youtube.items.length > 0 ? (
                results.youtube.items.map(video => (
                  <li key={video.id.videoId}>
                    <p>https://www.youtube.com/watch?v={video.id.videoId}</p>
                    <h3>{video.snippet.title}</h3>
                    <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
                    <button onClick={() => likeCourse(video.id.videoId)}>Like</button>
                    <button onClick={() => dislikeCourse(video.id.videoId)}>Dislike</button>
                    <button onClick={() => addToDo({ course_id: video.id.videoId, course_title: video.snippet.title })}>Add to To-Do List</button>
                  </li>
                ))
              ) : (
                <p>No YouTube results found.</p>
              )}
            </ul>
          </div>
          <div>
            <h2>Coursera Results</h2>
            <ul>
              {results.coursera && results.coursera.elements.length > 0 ? (
                results.coursera.elements.map(course => (
                  <li key={course.id}>
                    <h3>{course.name}</h3>
                    <h3>https://www.coursera.org/learn/{course.slug}</h3>
                    <h4>{course.enrollments}</h4>
                    <img src={course.imageUrl} alt={course.name} />
                    <p>{course.description}</p>
                    <button onClick={() => scrapeCourse(`https://www.coursera.org/learn/${course.slug}`)}>Scrape</button>
                    {scrapedData && (
                      <div>
                        <h2>Scraped Data</h2>
                        <p>Title: {scrapedData.Title}</p>
                        <p>Details: {scrapedData.Details}</p>
                        <p>Experience: {scrapedData.Experience}</p>
                        <p>Rating: {scrapedData.Ratings}</p>
                        <p>Reviews: {scrapedData.Review}</p>
                      </div>
                    )}
                    <button onClick={() => likeCourse(course.slug)}>Like</button>
                    <button onClick={() => dislikeCourse(course.slug)}>Dislike</button>
                    <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Set deadline"/>
              <button onClick={() => addToDo(course.id, course.name)}>Add to To-Do List</button>
                </li>
                ))
              ) : (
                <p>No Coursera results found.</p>
              )}
            </ul>
          </div>
          <div>
            <h2>Udemy Results</h2>
            <ul>
              {results.udemy && results.udemy.length > 0 ? (
                results.udemy.map(course => (
                  <li key={course.id}>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <button onClick={() => likeCourse(course.id)}>Like</button>
                    <button onClick={() => dislikeCourse(course.id)}>Dislike</button>
                    <button onClick={() => addToDo({ course_id: course.id, course_title: course.title })}>Add to To-Do List</button>
                  </li>
                ))
              ) : (
                <p>No Udemy results found.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <h1>You Are Not Logged In, Authenticate first</h1>
        </div>
      )}
    </div>
  );
};

export default SearchCourses;
