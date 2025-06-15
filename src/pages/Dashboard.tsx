import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GameCard } from '../components/game/GameCard';
import { PlayerCard } from '../components/player/PlayerCard';
import { useGameStore } from '../store/gameStore';
import { 
  PlusCircle, 
  Users, 
  History, 
  BarChart, 
  Play,
  Gamepad2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { games, players, currentGame } = useGameStore();
  
  // Get recent games
  const recentGames = [...games]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // Get top players by win rate
  const topPlayers = [...players]
    .filter(player => player.stats.gamesPlayed > 0)
    .sort((a, b) => {
      const aWinRate = a.stats.wins / a.stats.gamesPlayed;
      const bWinRate = b.stats.wins / b.stats.gamesPlayed;
      return bWinRate - aWinRate;
    })
    .slice(0, 3);
  
  return (
    <Layout>
      <LayoutHeader>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catan Master Pro</h1>
            <p className="text-gray-600 mt-1">Complete Catan game management system</p>
          </div>
          <div className="flex space-x-3">
            {currentGame && currentGame.isActive ? (
              <Button 
                onClick={() => navigate('/game/active')}
                className="bg-emerald-600 hover:bg-emerald-700"
                icon={<Gamepad2 size={16} />}
              >
                Resume Game
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/game/setup')}
                icon={<Play size={16} />}
              >
                Start New Game
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => navigate('/games/new')}
              icon={<PlusCircle size={16} />}
            >
              Record Game
            </Button>
          </div>
        </div>
      </LayoutHeader>
      
      <LayoutContent>
        {/* Active Game Alert */}
        {currentGame && currentGame.isActive && (
          <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Game in Progress</h3>
                  <p className="text-emerald-100">
                    Turn {currentGame.currentTurn} • {currentGame.players.length} players
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/game/active')}
                  variant="secondary"
                  icon={<Gamepad2 size={16} />}
                >
                  Continue Playing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-700 rounded-lg">
                  <History size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-emerald-100">
                    Total Games
                  </h2>
                  <p className="text-3xl font-bold">{games.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Users size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-amber-100">
                    Players
                  </h2>
                  <p className="text-3xl font-bold">{players.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <BarChart size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-blue-100">
                    Avg. Game Duration
                  </h2>
                  <p className="text-3xl font-bold">
                    {games.length > 0 
                      ? Math.round(games.reduce((sum, game) => sum + game.duration, 0) / games.length)
                      : 0} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Games</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/games')}
              >
                View All
              </Button>
            </div>
            
            {recentGames.length > 0 ? (
              <div className="space-y-4">
                {recentGames.map(game => (
                  <GameCard 
                    key={game.id} 
                    game={game}
                    onClick={() => navigate(`/games/${game.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-4">No games recorded yet</p>
                  <Button 
                    onClick={() => navigate('/game/setup')}
                    icon={<Play size={16} />}
                  >
                    Start Your First Game
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Top Players</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/players')}
              >
                View All
              </Button>
            </div>
            
            {topPlayers.length > 0 ? (
              <div className="space-y-4">
                {topPlayers.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onClick={() => navigate(`/players/${player.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-4">No players added yet</p>
                  <Button 
                    onClick={() => navigate('/players/new')}
                    icon={<PlusCircle size={16} />}
                  >
                    Add Your First Player
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
};