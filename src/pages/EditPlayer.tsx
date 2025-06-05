import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { PlayerForm } from '../components/player/PlayerForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const EditPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players } = useGameStore();
  
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
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/players/${id}`)}
            icon={<ArrowLeft size={16} />}
          >
            Back to Player
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Player</h1>
      </LayoutHeader>
      
      <LayoutContent>
        <div className="max-w-xl mx-auto">
          <PlayerForm 
            player={player} 
            onSave={() => navigate(`/players/${id}`)} 
          />
        </div>
      </LayoutContent>
    </Layout>
  );
};