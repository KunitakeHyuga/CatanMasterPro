import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { BoardEditor } from './BoardEditor';
import { BoardTemplates } from './BoardTemplates';
import { Plus, Minus, UserPlus, X, Save, Settings, Grid } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GameSession, PlayerColor, GamePlayer, BoardSetup } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { format } from 'date-fns';
import { generateDefaultBoard } from '../../utils/board';

const playerColors: PlayerColor[] = ['red', 'blue', 'white', 'orange', 'green', 'brown'];

interface GameFormProps {
  onSave: () => void;
  initialGame?: GameSession;
}

export const GameForm: React.FC<GameFormProps> = ({ onSave, initialGame }) => {
  const { players, addGame, updateGame, savedBoards, saveBoard } = useGameStore();
  
  const [date, setDate] = useState(initialGame?.date || format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(initialGame?.duration || 60);
  const [notes, setNotes] = useState(initialGame?.notes || '');
  const [tags, setTags] = useState<string[]>(initialGame?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [gameType, setGameType] = useState<'standard' | 'seafarers' | 'cities' | 'traders' | 'america'>('standard');
  
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>(
    initialGame?.players || []
  );
  
  const [boardSetup, setBoardSetup] = useState<BoardSetup>(
    initialGame?.boardSetup || generateDefaultBoard(gameType)
  );

  const [showBoardEditor, setShowBoardEditor] = useState(false);
  const [showBoardTemplates, setShowBoardTemplates] = useState(false);
  const [boardName, setBoardName] = useState('');

  const gameTypes = [
    { key: 'standard', name: 'カタンの開拓者たち (スタンダード版)', description: 'カタンシリーズの基本となるゲーム' },
    { key: 'seafarers', name: '航海者版 (海カタン)', description: '海を舞台にした拡張版で、海賊や交易船が登場' },
    { key: 'cities', name: '都市と騎士版 (騎士カタン)', description: '騎士や都市が登場し、より戦略的なゲーム' },
    { key: 'traders', name: '商人と蛮族版 (商人カタン)', description: '商人と蛮族が登場し、交易や交渉が重要' },
    { key: 'america', name: 'アメリカ大陸版 (アメリカ・カタン)', description: 'アメリカ大陸を舞台にした独立したゲーム' }
  ];

  const handleGameTypeChange = (newType: typeof gameType) => {
    setGameType(newType);
    setBoardSetup(generateDefaultBoard(newType));
  };

  const addPlayer = () => {
    if (gamePlayers.length >= 6) return;
    
    const availablePlayers = players.filter(
      player => !gamePlayers.some(gp => gp.playerId === player.id)
    );
    
    if (availablePlayers.length === 0) return;
    
    const nextPlayer = availablePlayers[0];
    const availableColors = playerColors.filter(
      color => !gamePlayers.some(gp => gp.color === color)
    );
    
    const newGamePlayer: GamePlayer = {
      id: uuidv4(),
      playerId: nextPlayer.id,
      name: nextPlayer.name,
      color: availableColors[0] || 'red',
      score: 0,
      rank: gamePlayers.length + 1,
      resourceProduction: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      buildings: { roads: 0, settlements: 0, cities: 0, devCards: 0 }
    };
    
    setGamePlayers([...gamePlayers, newGamePlayer]);
  };
  
  const removePlayer = (id: string) => {
    const updatedPlayers = gamePlayers.filter(player => player.id !== id);
    const rankedPlayers = updatedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    setGamePlayers(rankedPlayers);
  };
  
  const updatePlayerScore = (id: string, score: number) => {
    const updatedPlayers = gamePlayers.map(player => 
      player.id === id ? { ...player, score } : player
    );
    
    const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
    const rankedPlayers = sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    
    setGamePlayers(rankedPlayers);
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveBoard = (board: BoardSetup) => {
    if (!boardName.trim()) {
      alert('Please enter a name for the board setup');
      return;
    }
    
    saveBoard({
      ...board,
      name: boardName.trim()
    });
    
    setBoardName('');
    setShowBoardEditor(false);
    alert('Board setup saved successfully!');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (gamePlayers.length < 2) {
      alert('You need at least 2 players for a game');
      return;
    }
    
    const gameData: Omit<GameSession, 'id'> = {
      date,
      duration,
      players: gamePlayers,
      winner: gamePlayers.find(p => p.rank === 1)?.playerId || '',
      boardSetup,
      notes,
      tags
    };
    
    if (initialGame) {
      updateGame(initialGame.id, gameData);
    } else {
      addGame(gameData);
    }
    
    onSave();
  };

  if (showBoardEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Board Editor</h2>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Board name (optional)"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            <Button
              variant="outline"
              onClick={() => setShowBoardEditor(false)}
            >
              Back to Game
            </Button>
          </div>
        </div>
        <BoardEditor
          initialBoard={boardSetup}
          gamePlayers={gamePlayers}
          onSave={(board) => {
            setBoardSetup(board);
            if (boardName.trim()) {
              handleSaveBoard(board);
            } else {
              setShowBoardEditor(false);
            }
          }}
          onCancel={() => setShowBoardEditor(false)}
        />
      </div>
    );
  }

  if (showBoardTemplates) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Board Templates</h2>
          <Button
            variant="outline"
            onClick={() => setShowBoardTemplates(false)}
          >
            Back to Game
          </Button>
        </div>
        <BoardTemplates
          savedBoards={savedBoards}
          onSelectTemplate={(board) => {
            setBoardSetup(board);
            setShowBoardTemplates(false);
          }}
        />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Type
              </label>
              <div className="space-y-2">
                {gameTypes.map(type => (
                  <div key={type.key} className="flex items-start">
                    <input
                      type="radio"
                      id={type.key}
                      name="gameType"
                      value={type.key}
                      checked={gameType === type.key}
                      onChange={(e) => handleGameTypeChange(e.target.value as typeof gameType)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <label htmlFor={type.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {type.name}
                      </label>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Players</CardTitle>
            <Button 
              type="button" 
              onClick={addPlayer}
              variant="secondary"
              size="sm"
              icon={<UserPlus size={16} />}
              disabled={gamePlayers.length >= 6 || players.length === 0}
            >
              Add Player
            </Button>
          </CardHeader>
          <CardContent>
            {gamePlayers.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Add players to the game</p>
            ) : (
              <div className="space-y-3">
                {gamePlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="flex-1">
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePlayerScore(player.id, Math.max(0, player.score - 1))}
                        icon={<Minus size={16} />}
                      />
                      <span className="w-8 text-center">{player.score}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePlayerScore(player.id, player.score + 1)}
                        icon={<Plus size={16} />}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      Rank: {player.rank}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                      icon={<X size={16} />}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Board Setup</CardTitle>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBoardTemplates(true)}
                icon={<Grid size={16} />}
              >
                Templates
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBoardEditor(true)}
                icon={<Settings size={16} />}
              >
                Edit Board
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="transform scale-75">
                <HexBoard hexes={boardSetup.hexTiles} size={40} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Game Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Strategy notes, memorable moments..."
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Add a tag"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-emerald-400 hover:bg-emerald-200 hover:text-emerald-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSave}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          icon={<Save size={16} />}
        >
          Save Game
        </Button>
      </div>
    </form>
  );
};
