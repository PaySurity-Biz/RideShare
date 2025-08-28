import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { TripPage } from './pages/TripPage';
import { ProfilePage } from './pages/ProfilePage';
import { EarningsPage } from './pages/EarningsPage';
import { AirportQueuePage } from './pages/AirportQueuePage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/trip" element={<TripPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/earnings" element={<EarningsPage />} />
          <Route path="/airport-queue" element={<AirportQueuePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;