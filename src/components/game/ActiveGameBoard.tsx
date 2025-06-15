import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { HexBoard } from './HexBoard';
import { DiceRoller } from './DiceRoller';
import { PlayerPanel } from './PlayerPanel';
import { DevelopmentCardPanel } from './DevelopmentCardPanel';
import { useGameStore } from '../../store/gameStore';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Trophy,
  Users,
  Dices,
  Settings
} from 'lucide-react';

export const ActiveGameBoard: React.FC = () => {
  const { 
    currentGame, 
    lastRoll,
    nextTurn,
    endGame,
    rollDice,
    updateCurrentGame
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No active game</p>
          <Button onClick={() => window.location.href = '/games/new'}>
            Start New Game
          </Button>
        </div>
      </div>
    );
  }

  const currentPlayer = currentGame.players.find(p => p.id === currentGame.currentPlayer);
  const winner = currentGame.players.find(p => p.totalPoints >= 10);

  const handleEndGame = () => {
    if (winner && window.confirm(`Declare ${winner.name} as the winner?`)) {
      endGame(currentGame.id, winner.id);
    }
  };

  const handleNextTurn = () => {
    nextTurn();
  };

  const handleRollDice = () => {
    const roll = rollDice();
    // Handle resource distribution based on dice roll
    if (roll.total === 7) {
      // Handle robber movement
      console.log('Robber activated!');
    } else {
      // Distribute resources
      console.log(`Rolled ${roll.total} - distribute resources`);
    }
  };

  // Create player colors mapping
  const playerColors = React.useMemo(() => {
    return currentGame.players.reduce((acc, player) => {
      acc[player.id] = player.color;
      return acc;
    }, {} as Record<string, string>);
  }, [currentGame.players]);

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Catan Game in Progress</h1>
              <div className="flex items-center space-x-6 text-emerald-100">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{currentGame.players.length} Players</span>
                </div>
                <div className="flex items-center">
                  <Trophy size={16} className="mr-1" />
                  <span>Turn {currentGame.currentTurn}</span>
                </div>
                {lastRoll && (
                  <div className="flex items-center">
                    <Dices size={16} className="mr-1" />
                    <span>Last Roll: {lastRoll.total}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {winner ? (
                <Button
                  onClick={handleEndGame}
                  className="bg-amber-500 hover:bg-amber-600"
                  icon={<Trophy size={16} />}
                >
                  End Game
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleNextTurn}
                    variant="secondary"
                    icon={<SkipForward size={16} />}
                  >
                    Next Turn
                  </Button>
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="outline"
                    className="text-white border-white hover:bg-emerald-800"
                    icon={<Settings size={16} />}
                  >
                    Settings
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {currentPlayer && (
            <div className="mt-4 p-3 bg-emerald-800 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: currentPlayer.color }}
                />
                <span className="font-medium">
                  Current Turn: {currentPlayer.name}
                </span>
                {winner && (
                  <span className="ml-4 px-3 py-1 bg-amber-500 text-amber-900 rounded-full text-sm font-bold">
                    🏆 WINNER! 🏆
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Board */}
        <div className="lg:col-span-3 space-y-6">
          {/* Board */}
          <Card>
            <CardHeader>
              <CardTitle>Game Board</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <HexBoard
                hexes={currentGame.boardSetup.hexTiles}
                harbors={currentGame.boardSetup.harbors}
                buildings={currentGame.boardSetup.buildings}
                roads={currentGame.boardSetup.roads}
                robberPosition={currentGame.boardSetup.robberPosition}
                playerColors={playerColors}
                size={50}
                isInteractive={true}
              />
            </CardContent>
          </Card>

          {/* Dice Roller */}
          <DiceRoller onRoll={handleRollDice} lastRoll={lastRoll} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={20} className="mr-2" />
                Players
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentGame.players
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((player, index) => (
                  <PlayerPanel
                    key={player.id}
                    player={player}
                    isCurrentPlayer={player.id === currentGame.currentPlayer}
                    rank={index + 1}
                  />
                ))}
            </CardContent>
          </Card>

          {/* Development Cards */}
          <DevelopmentCardPanel 
            deck={currentGame.developmentCardDeck}
            players={currentGame.players}
          />
        </div>
      </div>
    </div>
  );
};