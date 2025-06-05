import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { PlayerCard } from '../components/player/PlayerCard';
import { useGameStore } from '../store/gameStore';
import { PlusCircle, Search, X } from 'lucide-react';

export const PlayersList: React.FC = () => {
  const navigate = useNavigate();
  const { players } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort players by games played (most first)
  const sortedPlayers = [...filteredPlayers].sort(
    (a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed
  );
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <Button 
            onClick={() => navigate('/players/new')}
            icon={<PlusCircle size={16} />}
          >
            Add Player
          </Button>
        </div>
        
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search players by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </LayoutHeader>
      
      <LayoutContent>
        {sortedPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPlayers.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => navigate(`/players/${player.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {players.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No players added yet</p>
                <Button 
                  onClick={() => navigate('/players/new')}
                  icon={<PlusCircle size={16} />}
                >
                  Add Your First Player
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500">No players match your search</p>
              </>
            )}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
};