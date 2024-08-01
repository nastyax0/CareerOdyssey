import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import httpClient from './httpClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await httpClient.get('http://localhost:3001/check_user', { withCredentials: true });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    checkUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
