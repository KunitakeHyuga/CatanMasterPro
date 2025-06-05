import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { GameForm } from '../components/game/GameForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NewGame: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/games')}
            icon={<ArrowLeft size={16} />}
          >
            Back to Games
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Record New Game</h1>
      </LayoutHeader>
      
      <LayoutContent>
        <GameForm onSave={() => navigate('/games')} />
      </LayoutContent>
    </Layout>
  );
};