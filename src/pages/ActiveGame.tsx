import React from 'react';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { ActiveGameBoard } from '../components/game/ActiveGameBoard';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActiveGame: React.FC = () => {
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
      </LayoutHeader>
      
      <LayoutContent>
        <ActiveGameBoard />
      </LayoutContent>
    </Layout>
  );
};