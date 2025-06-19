import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { GameForm } from '../components/game/GameForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const EditGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games } = useGameStore();
  
  const game = games.find(g => g.id === id);
  
  if (!game) {
    return (
      <Layout>
        <LayoutContent className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Game not found</p>
            <Button onClick={() => navigate('/games')}>
              Back to Games
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
            onClick={() => navigate(`/games/${id}`)}
            icon={<ArrowLeft size={16} />}
          >
            Back to Game
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Game</h1>
      </LayoutHeader>
      
      <LayoutContent>
        <GameForm
          initialGame={game}
          onSave={() => navigate(`/games/${id}`)}
          editableBoard={false} // 既存ゲームではボード編集は不要
        />
      </LayoutContent>
    </Layout>
  );
};