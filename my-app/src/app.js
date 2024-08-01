import React from 'react';
import Routes from './Routes';
import { UserProvider } from './UserContext';
import NavBar from './pages/navigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Base from './pages/base';
//import SearchCourses from './pages/searchCourses'; // Make sure to import SearchCourses

const App = () => (


  <UserProvider>
  <div>
    <NavBar />
   <Routes />
  </div>
</UserProvider>

);

export default App;
