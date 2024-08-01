import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Ensure you have the correct import for your homepage
import Liked from './pages/liked';
import Disliked from './pages/disliked';
import Signup from './pages/signUp';
import Signin from './pages/signIn';
import Report from './pages/report';
import SearchCourses from './pages/searchCourses';
import ToDo from './pages/todolist';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/searchCourses" element={<SearchCourses />} />
      <Route path="/liked" element={<Liked />} />
      <Route path="/disliked" element={<Disliked />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/report" element={<Report/>}/>
      <Route path="/todolist" element={<ToDo/>}/>
    </Routes>
  </Router>
);

export default AppRoutes;
