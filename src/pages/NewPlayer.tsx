import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { PlayerForm } from '../components/player/PlayerForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NewPlayer: React.FC = () => {
  const navigate = useNavigate();
  
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Player</h1>
      </LayoutHeader>
      
      <LayoutContent>
        <div className="max-w-xl mx-auto">
          <PlayerForm onSave={() => navigate('/players')} />
        </div>
      </LayoutContent>
    </Layout>
  );
};