import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { GameCard } from '../components/game/GameCard';
import { useGameStore } from '../store/gameStore';
import { PlusCircle, Search, X } from 'lucide-react';

export const GamesList: React.FC = () => {
  const navigate = useNavigate();
  const { games } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredGames = games.filter(game => {
    const searchLower = searchTerm.toLowerCase();
    
    // Search in player names
    const playerMatch = game.players.some(player => 
      player.name.toLowerCase().includes(searchLower)
    );
    
    // Search in tags
    const tagMatch = game.gameDetails.tags.some(tag =>
      tag.toLowerCase().includes(searchLower)
    );

    // Search in notes
    const notesMatch = game.gameDetails.notes.toLowerCase().includes(searchLower);
    
    // Search in date
    const dateMatch = game.date.includes(searchTerm);
    
    return playerMatch || tagMatch || notesMatch || dateMatch;
  });
  
  // Sort games by date (newest first)
  const sortedGames = [...filteredGames].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Games</h1>
          <Button 
            onClick={() => navigate('/games/new')}
            icon={<PlusCircle size={16} />}
          >
            New Game
          </Button>
        </div>
        
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search games by player, tag, or date..."
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
        {sortedGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => navigate(`/games/${game.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {games.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No games recorded yet</p>
                <Button 
                  onClick={() => navigate('/games/new')}
                  icon={<PlusCircle size={16} />}
                >
                  Record Your First Game
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500">No games match your search</p>
              </>
            )}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
};