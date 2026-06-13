import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import List from './pages/List';
import Publish from './pages/Publish';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import ItemDetail from './pages/ItemDetail';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<List />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </div>
  );
};

export default App;
