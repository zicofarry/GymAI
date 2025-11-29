import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSchedule from './pages/CreateSchedule';
import ScheduleResult from './pages/ScheduleResult';
import Login from './pages/Login';     // <-- Import baru
import Register from './pages/Register'; // <-- Import baru
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <ChatWidget />  {/* Komponen Chatbot AI */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />       {/* Route baru */}
        <Route path="/register" element={<Register />} /> {/* Route baru */}
        <Route path="/create" element={<CreateSchedule />} />
        <Route path="/result" element={<ScheduleResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;