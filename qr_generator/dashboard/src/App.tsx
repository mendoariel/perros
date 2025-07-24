import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MedalFrontsGenerator from './components/MedalFrontsGenerator';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-6">
              <Dashboard />
            </div>
          } />
          <Route path="/creacion-de-frentes-de-medallas" element={<MedalFrontsGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
