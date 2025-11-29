import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSchedule from './pages/CreateSchedule';
import ScheduleResult from './pages/ScheduleResult';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatWidget from './components/ChatWidget';
import ScheduleRouter from './pages/ScheduleRouter'; 

function App() {
  return (
    <Router>
      <ChatWidget />  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* RUTE UTAMA SCHEDULE: Router Cerdas */}
        <Route path="/schedule" element={<ScheduleRouter />} /> 

        {/* RUTE TUJUAN (Accessed via ScheduleRouter) */}
        <Route path="/create" element={<CreateSchedule />} />
        <Route path="/result" element={<ScheduleResult />} />
      </Routes>
    </Router>
  );
}

export default App;