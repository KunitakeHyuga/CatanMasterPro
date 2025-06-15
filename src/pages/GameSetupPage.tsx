import React from 'react';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { GameSetup } from '../components/game/GameSetup';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GameSetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            icon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">New Game Setup</h1>
      </LayoutHeader>
      
      <LayoutContent>
        <GameSetup />
      </LayoutContent>
    </Layout>
  );
};