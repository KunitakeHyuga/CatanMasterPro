import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { PlayerStats } from '../components/stats/PlayerStats';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export const PlayerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players, games, removePlayer } = useGameStore();
  
  const player = players.find(p => p.id === id);
  
  if (!player) {
    return (
      <Layout>
        <LayoutContent className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Player not found</p>
            <Button onClick={() => navigate('/players')}>
              Back to Players
            </Button>
          </div>
        </LayoutContent>
      </Layout>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      removePlayer(player.id);
      navigate('/players');
    }
  };
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/players')}
            icon={<ArrowLeft size={16} />}
          >
            Back to Players
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {player.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/players/edit/${player.id}`)}
              icon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </LayoutHeader>
      
      <LayoutContent>
        <PlayerStats player={player} games={games} />
      </LayoutContent>
    </Layout>
  );
};