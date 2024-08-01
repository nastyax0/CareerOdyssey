import React, { useState } from 'react';
import httpClient from '../httpClient';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post('http://localhost:3001/register', { username, password });
      console.log(response.data);
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  };

  return (
    <div>
      <h1>Make A New Account</h1>
    <form onSubmit={handleSignup}>
      <div>      
        <label>Username: </label>
        <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /></div>
      <div>
      <label>Password: </label>

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /></div>
      
      <button type="submit">Sign Up</button>
    </form>
    </div>
  );
};

export default Signup;
