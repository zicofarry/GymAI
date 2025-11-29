import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSchedule from './pages/CreateSchedule';
import ScheduleResult from './pages/ScheduleResult';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateSchedule />} />
        <Route path="/result" element={<ScheduleResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
