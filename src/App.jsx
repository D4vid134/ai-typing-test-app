import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Home from './pages/Home/Home'
import Custom from './pages/Custom/Custom'
import About from './pages/About/About'


function App() {
  return (
    <div className="App">
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route
              index
              element={
                <Home />
              }
            />
            <Route
              path="custom"
              element={
                <Custom />
              }
            />
            <Route
              path="about"
              element={
                <About />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
