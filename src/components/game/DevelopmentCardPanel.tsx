import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { GamePlayer, DevelopmentCardDeck, DevelopmentCard } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { 
  Scroll,
  Sword,
  Trophy,
  Route,
  Coins,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';

interface DevelopmentCardPanelProps {
  deck: DevelopmentCardDeck;
  players: GamePlayer[];
}

export const DevelopmentCardPanel: React.FC<DevelopmentCardPanelProps> = ({ 
  deck, 
  players 
}) => {
  const { drawDevelopmentCard, playDevelopmentCard, currentGame } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showPlayerCards, setShowPlayerCards] = useState<Record<string, boolean>>({});

  const handleDrawCard = () => {
    if (!selectedPlayer || !currentGame) return;
    
    const card = drawDevelopmentCard(selectedPlayer);
    if (card) {
      console.log(`${selectedPlayer} drew a ${card.name} card`);
    } else {
      alert('No more development cards available!');
    }
  };

  const handlePlayCard = (playerId: string, cardId: string) => {
    if (!currentGame) return;
    playDevelopmentCard(playerId, cardId);
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'knight': return <Sword size={16} className="text-red-600" />;
      case 'victory_point': return <Trophy size={16} className="text-amber-600" />;
      case 'road_building': return <Route size={16} className="text-blue-600" />;
      case 'year_of_plenty': return <Coins size={16} className="text-green-600" />;
      case 'monopoly': return <Building size={16} className="text-purple-600" />;
      default: return <Scroll size={16} className="text-gray-600" />;
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'knight': return 'bg-red-50 border-red-200 text-red-800';
      case 'victory_point': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'road_building': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'year_of_plenty': return 'bg-green-50 border-green-200 text-green-800';
      case 'monopoly': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const togglePlayerCards = (playerId: string) => {
    setShowPlayerCards(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scroll size={20} className="mr-2" />
          Development Cards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deck Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Cards Remaining: {deck.totalRemaining}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Sword size={12} className="mr-1 text-red-600" />
                Knights
              </span>
              <span className="font-medium">{deck.knights}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Trophy size={12} className="mr-1 text-amber-600" />
                Victory
              </span>
              <span className="font-medium">{deck.victoryPoints.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Route size={12} className="mr-1 text-blue-600" />
                Roads
              </span>
              <span className="font-medium">{deck.roadBuilding}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Coins size={12} className="mr-1 text-green-600" />
                Plenty
              </span>
              <span className="font-medium">{deck.yearOfPlenty}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Building size={12} className="mr-1 text-purple-600" />
                Monopoly
              </span>
              <span className="font-medium">{deck.monopoly}</span>
            </div>
          </div>
        </div>

        {/* Draw Card Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Draw Card for Player:
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select Player</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleDrawCard}
            disabled={!selectedPlayer || deck.totalRemaining === 0}
            size="sm"
            className="w-full"
            icon={<Scroll size={16} />}
          >
            Draw Development Card
          </Button>
        </div>

        {/* Player Cards */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Player Cards</h4>
          {players.map(player => (
            <div key={player.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium text-sm">{player.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({player.developmentCards.length} cards)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePlayerCards(player.id)}
                  icon={showPlayerCards[player.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                >
                  {showPlayerCards[player.id] ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showPlayerCards[player.id] && (
                <div className="space-y-2">
                  {player.developmentCards.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No cards</p>
                  ) : (
                    player.developmentCards.map(card => (
                      <div 
                        key={card.id} 
                        className={`p-2 rounded border text-xs ${getCardColor(card.type)} ${
                          card.isPlayed ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getCardIcon(card.type)}
                            <span className="ml-2 font-medium">{card.name}</span>
                            {card.isPlayed && (
                              <span className="ml-2 text-xs opacity-75">(Played)</span>
                            )}
                          </div>
                          {!card.isPlayed && card.type !== 'victory_point' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayCard(player.id, card.id)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Play
                            </Button>
                          )}
                        </div>
                        {card.victoryPointValue && (
                          <div className="text-xs mt-1 opacity-75">
                            +{card.victoryPointValue} Victory Point
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};