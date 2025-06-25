import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent 
} from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { HexBoard } from '../components/game/HexBoard';
import { BoardEditor } from '../components/game/BoardEditor';
import { DevelopmentCardTableEditor } from '../components/game/DevelopmentCardTableEditor';
import { format } from 'date-fns';
import { useGameStore } from '../store/gameStore';
import { BoardSetup, GamePlayer } from '../models/types';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Trophy,
  CalendarDays,
  Download,
  Settings
} from 'lucide-react';

export const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games, removeGame, updateGame } = useGameStore();
  
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
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      removeGame(game.id);
      navigate('/games');
    }
  };

  // ボードエディタ表示状態
  const [showBoardEditor, setShowBoardEditor] = useState(false);

  // プレイヤー情報をローカルで管理
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>(
    game.players.map(p => ({
      resources: p.resources ?? { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      developmentCards: p.developmentCards ?? [],
      knightsPlayed: p.knightsPlayed ?? 0,
      longestRoadLength: p.longestRoadLength ?? 0,
      hasLongestRoad: p.hasLongestRoad ?? false,
      hasLargestArmy: p.hasLargestArmy ?? false,
      totalPoints: p.totalPoints ?? 0,
      ...p
    }))
  );

  // プレイヤーIDと色の対応表を作成
  const playerColors = React.useMemo(() => {
    return gamePlayers.reduce((acc, p) => {
      acc[p.id] = p.color;
      return acc;
    }, {} as Record<string, string>);
  }, [gamePlayers]);

  // HexBoard の参照を保持し画像として保存できるようにする
  const boardRef = useRef<SVGSVGElement>(null);

  // ボード編集完了時にゲームデータを更新する
  const handleBoardSave = (board: BoardSetup) => {
    updateGame(game.id, { boardSetup: board });
    setShowBoardEditor(false);
  };

  // プレイヤー変更時にストアを更新
  const handlePlayersChange = (players: GamePlayer[]) => {
    setGamePlayers(players);
    updateGame(game.id, { players });
  };

  if (showBoardEditor) {
    return (
      <Layout>
        <LayoutHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBoardEditor(false)}
              icon={<ArrowLeft size={16} />}
            >
              Back to Game
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Board</h1>
        </LayoutHeader>

        <LayoutContent>
          <BoardEditor
            initialBoard={game.boardSetup}
            gamePlayers={gamePlayers}
            onSave={handleBoardSave}
            onCancel={() => setShowBoardEditor(false)}
          />
        </LayoutContent>
      </Layout>
    );
  }

  // export 処理で text 要素のスタイルを保持するためのヘルパー
  const inlineTextStyles = (svg: SVGSVGElement) => {
    const texts = svg.querySelectorAll('text');
    texts.forEach(t => {
      const style = window.getComputedStyle(t);
      t.setAttribute('font-size', style.fontSize);
      t.setAttribute('font-family', style.fontFamily);
      t.setAttribute('font-weight', style.fontWeight);
    });
  };

  // ボードを画像としてエクスポートする
  const exportBoard = () => {
    const svgEl = boardRef.current;
    if (!svgEl) return;
    inlineTextStyles(svgEl);
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const width = svgEl.clientWidth;
    const height = svgEl.clientHeight;
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'catan-board.jpg';
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  };
  
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Game from {format(new Date(game.date), 'MMMM d, yyyy')}
          </h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/games/edit/${game.id}`)}
              icon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </LayoutHeader>
      
      <LayoutContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {format(new Date(game.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{game.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Winner</p>
                      <div className="flex items-center">
                      <p className="font-medium">
                        {gamePlayers.find(p => p.playerId === game.winner)?.name}
                      </p>
                      <div
                        className="ml-2 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: gamePlayers.find(p => p.playerId === game.winner)?.color
                        }}
                      />
                      </div>
                    </div>
                  </div>
                </div>
                
                {game.gameDetails.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Game Notes
                    </h3>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{game.gameDetails.notes}</p>
                  </div>
                )}

                {game.gameDetails.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {game.gameDetails.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Board Setup</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportBoard}
                    icon={<Download size={16} />}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBoardEditor(true)}
                    icon={<Settings size={16} />}
                  >
                    Edit Board
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <HexBoard
                  ref={boardRef}
                  hexes={game.boardSetup.hexTiles}
                  harbors={game.boardSetup.harbors}
                  buildings={game.boardSetup.buildings}
                  roads={game.boardSetup.roads}
                  robberPosition={game.boardSetup.robberPosition}
                  playerColors={playerColors}
                  size={60}
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <DevelopmentCardTableEditor
              players={gamePlayers}
              onChange={handlePlayersChange}
              showAddPlayer
            />
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
};