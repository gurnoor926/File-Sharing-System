import React,{useEffect} from 'react'
import Register from './components/Register';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import File from './components/File';
import User_files from './components/User_files';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "./assets/main.css";

function App() {
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          window.location.href = '/'; // or '/login'
        } else {
          const timeLeft = decoded.exp * 1000 - Date.now();
          const timeout = setTimeout(() => {
            localStorage.removeItem('token');
            alert('Session expired. Please log in again.');
            window.location.href = '/'; // or '/login'
          }, timeLeft);

          return () => clearTimeout(timeout); // Clean up on unmount
        }
      } catch (e) {
        console.error('Invalid token:', e);
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
  }, [token]);
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={token?<File />:<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fileupload" element={<FileUpload />} />
          <Route path="/user_files" element={<User_files />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App;
