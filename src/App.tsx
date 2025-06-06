import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { GamesList } from './pages/GamesList';
import { PlayersList } from './pages/PlayersList';
import { GameDetails } from './pages/GameDetails';
import { PlayerDetails } from './pages/PlayerDetails';
import { NewGame } from './pages/NewGame';
import { EditGame } from './pages/EditGame';
import { NewPlayer } from './pages/NewPlayer';
import { EditPlayer } from './pages/EditPlayer';

function App() {
  return (
    <BrowserRouter basename="/CatanMasterPro">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        <Route path="/games" element={<GamesList />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/games/new" element={<NewGame />} />
        <Route path="/games/edit/:id" element={<EditGame />} />
        
        <Route path="/players" element={<PlayersList />} />
        <Route path="/players/:id" element={<PlayerDetails />} />
        <Route path="/players/new" element={<NewPlayer />} />
        <Route path="/players/edit/:id" element={<EditPlayer />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;