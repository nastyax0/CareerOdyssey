import React, { useState } from 'react';
import httpClient from '../httpClient';
const Signin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post('http://localhost:3001/login', { username, password });
      console.log(response.data);
      localStorage.setItem('user_id', response.data.user_id);
      window.location.href="./searchCourses";
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  return (
    //<div>Sign In to CareerOdyssey</div>
    <form onSubmit={handleSignin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
};

export default Signin;
