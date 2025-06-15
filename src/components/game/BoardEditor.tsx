import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { HexTile, ResourceType, Harbor, HarborType, BoardSetup, GamePlayer, Building, Road, Vertex, Edge } from '../../models/types';
import { HexBoard } from './HexBoard';
import { Shuffle, RotateCcw, Save, Download, Upload, Home, Route } from 'lucide-react';
import { generateDefaultBoard } from './GameForm';

const computeVertices = (size: number): Vertex[] => {
  const verts: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    verts.push({ x: size * Math.cos(angle), y: size * Math.sin(angle) });
  }
  return verts;
};

const getHexPosition = (col: number, row: number, size: number) => ({
  x: col * (size * Math.sqrt(3)),
  y: row * (size * 1.5),
});

const resourceTypes: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'desert', 'ocean'];
const harborTypes: HarborType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'any'];
const numberTokens = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

interface BoardEditorProps {
  initialBoard?: BoardSetup;
  gamePlayers?: GamePlayer[];
  onSave: (board: BoardSetup) => void;
  onCancel: () => void;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  initialBoard,
  gamePlayers = [],
  onSave,
  onCancel
}) => {
  const [hexTiles, setHexTiles] = useState<HexTile[]>(
    initialBoard?.hexTiles || generateDefaultBoard().hexTiles
  );
  const [harbors, setHarbors] = useState<Harbor[]>(
    initialBoard?.harbors || []
  );
  const [buildings, setBuildings] = useState<Building[]>(
    initialBoard?.buildings || []
  );
  const [roads, setRoads] = useState<Road[]>(
    initialBoard?.roads || []
  );
  const [robberPosition, setRobberPosition] = useState(
    initialBoard?.robberPosition || { x: 2, y: 2 }
  );
  const [selectedTool, setSelectedTool] = useState<'resource' | 'number' | 'harbor' | 'robber' | 'building' | 'road'>('resource');
  const [selectedResource, setSelectedResource] = useState<ResourceType>('wood');
  const [selectedNumber, setSelectedNumber] = useState<number>(6);
  const [selectedHarbor, setSelectedHarbor] = useState<HarborType>('any');
  const [selectedPlayer, setSelectedPlayer] = useState<string>(gamePlayers[0]?.id || '');
  const [selectedBuildingType, setSelectedBuildingType] = useState<'settlement' | 'city'>('settlement');

  const handleHexClick = useCallback((hex: HexTile) => {
    if (selectedTool === 'resource') {
      setHexTiles(prev => prev.map(h => 
        h.id === hex.id 
          ? { ...h, type: selectedResource, number: selectedResource === 'desert' ? undefined : h.number }
          : h
      ));
    } else if (selectedTool === 'number' && hex.type !== 'desert' && hex.type !== 'ocean') {
      setHexTiles(prev => prev.map(h => 
        h.id === hex.id ? { ...h, number: selectedNumber } : h
      ));
    } else if (selectedTool === 'robber' && hex.type !== 'ocean') {
      setRobberPosition({ x: hex.position.x, y: hex.position.y });
    }
  }, [selectedTool, selectedResource, selectedNumber]);

  const handleVertexClick = useCallback((vertex: Vertex) => {
    if (selectedTool === 'building' && selectedPlayer) {
      const existingBuilding = buildings.find(b => 
        Math.abs(b.position.x - vertex.x) < 5 && Math.abs(b.position.y - vertex.y) < 5
      );
      
      if (existingBuilding) {
        // Remove existing building
        setBuildings(prev => prev.filter(b => b !== existingBuilding));
      } else {
        // Add new building
        const newBuilding: Building = {
          type: selectedBuildingType,
          position: vertex,
          playerId: selectedPlayer
        };
        setBuildings(prev => [...prev, newBuilding]);
      }
    }
  }, [selectedTool, selectedPlayer, selectedBuildingType, buildings]);

  const handleEdgeClick = useCallback((edge: Edge) => {
    if (selectedTool === 'road' && selectedPlayer) {
      const existingRoad = roads.find(r =>
        (Math.abs(r.position.from.x - edge.from.x) < 5 && Math.abs(r.position.from.y - edge.from.y) < 5 &&
         Math.abs(r.position.to.x - edge.to.x) < 5 && Math.abs(r.position.to.y - edge.to.y) < 5) ||
        (Math.abs(r.position.from.x - edge.to.x) < 5 && Math.abs(r.position.from.y - edge.to.y) < 5 &&
         Math.abs(r.position.to.x - edge.from.x) < 5 && Math.abs(r.position.to.y - edge.from.y) < 5)
      );
      
      if (existingRoad) {
        // Remove existing road
        setRoads(prev => prev.filter(r => r !== existingRoad));
      } else {
        // Add new road
        const newRoad: Road = {
          position: edge,
          playerId: selectedPlayer
        };
        setRoads(prev => [...prev, newRoad]);
      }
    }
    if (selectedTool === 'harbor') {
      const size = 60;
      const tolerance = 5;
      const matchingHexes: HexTile[] = [];

      hexTiles.forEach(hex => {
        const pos = getHexPosition(hex.position.x, hex.position.y, size);
        const verts = computeVertices(size);
        verts.forEach((v, i) => {
          const from = { x: pos.x + v.x, y: pos.y + v.y };
          const to = {
            x: pos.x + verts[(i + 1) % 6].x,
            y: pos.y + verts[(i + 1) % 6].y,
          };
          const matches =
            (Math.abs(from.x - edge.from.x) < tolerance &&
              Math.abs(from.y - edge.from.y) < tolerance &&
              Math.abs(to.x - edge.to.x) < tolerance &&
              Math.abs(to.y - edge.to.y) < tolerance) ||
            (Math.abs(from.x - edge.to.x) < tolerance &&
              Math.abs(from.y - edge.to.y) < tolerance &&
              Math.abs(to.x - edge.from.x) < tolerance &&
              Math.abs(to.y - edge.from.y) < tolerance);
          if (matches) matchingHexes.push(hex);
        });
      });

      if (matchingHexes.length !== 2) return;
      const oceanHex = matchingHexes.find(h => h.type === 'ocean');
      const landHex = matchingHexes.find(h => h.type !== 'ocean');
      if (!oceanHex || !landHex) return;

      const oceanCenter = getHexPosition(oceanHex.position.x, oceanHex.position.y, size);
      const midPoint = {
        x: (edge.from.x + edge.to.x) / 2,
        y: (edge.from.y + edge.to.y) / 2,
      };

      const edgeVec = { x: edge.to.x - edge.from.x, y: edge.to.y - edge.from.y };
      const rightNormal = { x: -edgeVec.y, y: edgeVec.x };
      const toOcean = { x: oceanCenter.x - midPoint.x, y: oceanCenter.y - midPoint.y };
      const dot = rightNormal.x * toOcean.x + rightNormal.y * toOcean.y;
      const oceanSide: 'left' | 'right' = dot > 0 ? 'right' : 'left';

      const existingIndex = harbors.findIndex(h =>
        Math.abs(h.position.x - midPoint.x) < tolerance &&
        Math.abs(h.position.y - midPoint.y) < tolerance,
      );

      if (existingIndex !== -1) {
        setHarbors(prev => prev.filter((_, i) => i !== existingIndex));
      } else {
        setHarbors(prev => [
          ...prev,
          {
            type: selectedHarbor,
            position: midPoint,
            edge,
            oceanSide,
          },
        ]);
      }
    }
  }, [selectedTool, selectedPlayer, roads, harbors, selectedHarbor, hexTiles]);

  const randomizeBoard = () => {
    const landTiles = hexTiles.filter(h => h.type !== 'ocean');
    const resourcePool: ResourceType[] = [
      'wood', 'wood', 'wood', 'wood',
      'sheep', 'sheep', 'sheep', 'sheep',
      'wheat', 'wheat', 'wheat', 'wheat',
      'brick', 'brick', 'brick',
      'ore', 'ore', 'ore',
      'desert'
    ];

    const shuffledResources = [...resourcePool].sort(() => Math.random() - 0.5);
    const shuffledNumbers = [...numberTokens].sort(() => Math.random() - 0.5);
    let resourceIndex = 0;
    let numberIndex = 0;
    const newHexes = hexTiles.map(hex => {
      if (hex.type === 'ocean') {
        return hex; // Keep ocean tiles as they are
      }
      
      const newType = shuffledResources[resourceIndex++] as ResourceType;
      return {
        ...hex,
        type: newType,
        number: newType === 'desert' ? undefined : shuffledNumbers[numberIndex++]
      };
    });
    
    setHexTiles(newHexes);
  };

  const resetBoard = () => {
    const defaultBoard = generateDefaultBoard();
    setHexTiles(defaultBoard.hexTiles);
    setHarbors(defaultBoard.harbors);
    setBuildings([]);
    setRoads([]);
    setRobberPosition(defaultBoard.robberPosition);
  };

  const exportBoard = () => {
    const boardData = {
      hexTiles,
      harbors,
      robberPosition,
      buildings,
      roads,
      numberTokens: []
    };
    
    const dataStr = JSON.stringify(boardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catan-board.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const boardData = JSON.parse(e.target?.result as string);
        if (boardData.hexTiles) setHexTiles(boardData.hexTiles);
        if (boardData.harbors) setHarbors(boardData.harbors);
        if (boardData.buildings) setBuildings(boardData.buildings);
        if (boardData.roads) setRoads(boardData.roads);
        if (boardData.robberPosition) setRobberPosition(boardData.robberPosition);
      } catch (error) {
        alert('Invalid board file format');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const board: BoardSetup = {
      hexTiles,
      harbors,
      robberPosition,
      buildings,
      roads,
      numberTokens: []
    };
    onSave(board);
  };

  // Create player colors mapping
  const playerColors = gamePlayers.reduce((acc, player) => {
    acc[player.id] = player.color;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      {/* ツールパネル */}
      <Card>
        <CardHeader>
          <CardTitle>ボードエディター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* ツール選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                編集モード
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'resource', label: 'リソース' },
                  { key: 'number', label: '数字' },
                  { key: 'harbor', label: '港' },
                  { key: 'robber', label: '盗賊' },
                  { key: 'building', label: '建物', icon: <Home size={16} /> },
                  { key: 'road', label: '道路', icon: <Route size={16} /> }
                ].map(tool => (
                  <Button
                    key={tool.key}
                    variant={selectedTool === tool.key ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTool(tool.key as any)}
                    icon={tool.icon}
                  >
                    {tool.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* リソース選択 */}
            {selectedTool === 'resource' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リソースを選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {resourceTypes.map(resource => (
                    <Button
                      key={resource}
                      variant={selectedResource === resource ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedResource(resource)}
                      className="capitalize"
                    >
                      {resource === 'wood' ? '森林' :
                       resource === 'brick' ? '丘陵' :
                       resource === 'sheep' ? '牧草地' :
                       resource === 'wheat' ? '農地' :
                       resource === 'ore' ? '山地' :
                       resource === 'ocean' ? '海' :
                       '砂漠'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 数字選択 */}
            {selectedTool === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数字を選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(number => (
                    <Button
                      key={number}
                      variant={selectedNumber === number ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedNumber(number)}
                      className={number === 6 || number === 8 ? 'text-red-600 font-bold' : ''}
                    >
                      {number}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 港選択 */}
            {selectedTool === 'harbor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  港の種類を選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {harborTypes.map(harbor => (
                    <Button
                      key={harbor}
                      variant={selectedHarbor === harbor ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedHarbor(harbor)}
                      className="capitalize"
                    >
                      {harbor === 'any' ? '3:1' : `2:1 ${harbor}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 建物・道路用プレイヤー選択 */}
            {(selectedTool === 'building' || selectedTool === 'road') && gamePlayers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレイヤーを選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {gamePlayers.map(player => (
                    <Button
                      key={player.id}
                      variant={selectedPlayer === player.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPlayer(player.id)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: player.color }}
                      />
                      {player.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 建物タイプ選択 */}
            {selectedTool === 'building' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  建物タイプ
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedBuildingType === 'settlement' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBuildingType('settlement')}
                  >
                    開拓地
                  </Button>
                  <Button
                    variant={selectedBuildingType === 'city' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBuildingType('city')}
                  >
                    都市
                  </Button>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={randomizeBoard}
                icon={<Shuffle size={16} />}
              >
                ランダム生成
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetBoard}
                icon={<RotateCcw size={16} />}
              >
                リセット
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportBoard}
                icon={<Download size={16} />}
              >
                エクスポート
              </Button>
              <label className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  icon={<Upload size={16} />}
                >
                  インポート
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importBoard}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ボード表示 */}
      <Card>
        <CardHeader>
          <CardTitle>ボードレイアウト</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <HexBoard
            hexes={hexTiles}
            harbors={harbors}
            buildings={buildings}
            roads={roads}
            robberPosition={robberPosition}
            playerColors={playerColors}
            onHexClick={handleHexClick}
            onVertexClick={handleVertexClick}
            onEdgeClick={handleEdgeClick}
            isInteractive={true}
            size={60}
          />
        </CardContent>
      </Card>

      {/* 保存/キャンセルボタン */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSave} icon={<Save size={16} />}>
          ボードを保存
        </Button>
      </div>
    </div>
  );
};