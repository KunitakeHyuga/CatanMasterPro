import React, { useState, useCallback, useRef } from 'react';
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

const verticesEqual = (a: Vertex, b: Vertex, tol = 5) =>
  Math.abs(a.x - b.x) < tol && Math.abs(a.y - b.y) < tol;

const getAdjacentVertices = (
  vertex: Vertex,
  hexes: HexTile[],
  size: number
) => {
  const adjacent: Vertex[] = [];
  hexes.forEach((hex) => {
    const pos = getHexPosition(hex.position.x, hex.position.y, size);
    const verts = computeVertices(size);
    verts.forEach((v, i) => {
      const globalV = { x: pos.x + v.x, y: pos.y + v.y };
      if (verticesEqual(globalV, vertex, 5)) {
        const prev = verts[(i + 5) % 6];
        const next = verts[(i + 1) % 6];
        adjacent.push(
          { x: pos.x + prev.x, y: pos.y + prev.y },
          { x: pos.x + next.x, y: pos.y + next.y }
        );
      }
    });
  });
  return adjacent;
};

// 頂点に隣接するヘクスタイルを取得するためのユーティリティ
const getAdjacentHexes = (
  vertex: Vertex,
  hexes: HexTile[],
  size: number
) =>
  hexes.filter((hex) => {
    const pos = getHexPosition(hex.position.x, hex.position.y, size);
    return computeVertices(size).some((v) =>
      verticesEqual({ x: pos.x + v.x, y: pos.y + v.y }, vertex)
    );
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
  // HexBoard の svg 要素を参照するための ref
  const svgRef = useRef<SVGSVGElement>(null);
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

  const availableVertices = React.useMemo(() => {
    if (selectedTool !== 'building' || !selectedPlayer) return [] as Vertex[];
    const verts: Vertex[] = [];
    hexTiles.forEach((hex) => {
      const pos = getHexPosition(hex.position.x, hex.position.y, 60);
      computeVertices(60).forEach((v) => {
        const globalV = { x: pos.x + v.x, y: pos.y + v.y };
        if (!verts.some((existing) => verticesEqual(existing, globalV))) {
          verts.push(globalV);
        }
      });
    });
    const buildingCount = buildings.filter((b) => b.playerId === selectedPlayer).length;
    return verts.filter((v) => {
      const hasBuilding = buildings.some((b) => verticesEqual(b.position, v));
      if (hasBuilding) return false;
      const adjHexes = getAdjacentHexes(v, hexTiles, 60);
      // 陸タイルが隣接していない頂点では建物を置けない
      if (!adjHexes.some((h) => h.type !== 'ocean')) return false;
      const adjacent = getAdjacentVertices(v, hexTiles, 60);
      const blocked = buildings.some((b) => adjacent.some((a) => verticesEqual(b.position, a)));
      if (blocked) return false;
      if (buildingCount < 2) return true;
      const hasRoad = roads.some(
        (r) =>
          r.playerId === selectedPlayer &&
          (verticesEqual(r.position.from, v) || verticesEqual(r.position.to, v))
      );
      return hasRoad;
    });
  }, [selectedTool, selectedPlayer, buildings, roads, hexTiles]);

  const availableEdges = React.useMemo(() => {
    if (selectedTool !== 'road' || !selectedPlayer) return [] as Edge[];
    const buildingCount = buildings.filter((b) => b.playerId === selectedPlayer).length;
    if (buildingCount === 0) return [] as Edge[];
    const edges: Edge[] = [];
    hexTiles.forEach((hex) => {
      const pos = getHexPosition(hex.position.x, hex.position.y, 60);
      const verts = computeVertices(60).map((v) => ({ x: pos.x + v.x, y: pos.y + v.y }));
      verts.forEach((v, i) => {
        const from = v;
        const to = verts[(i + 1) % 6];
        if (
          !edges.some(
            (e) =>
              (verticesEqual(e.from, from) && verticesEqual(e.to, to)) ||
              (verticesEqual(e.from, to) && verticesEqual(e.to, from))
          )
        ) {
          edges.push({ from, to });
        }
      });
    });
    return edges.filter((e) => {
      const exists = roads.some(
        (r) =>
          (verticesEqual(r.position.from, e.from) && verticesEqual(r.position.to, e.to)) ||
          (verticesEqual(r.position.from, e.to) && verticesEqual(r.position.to, e.from))
      );
      if (exists) return false;
      const connectedBuilding = buildings.some(
        (b) =>
          b.playerId === selectedPlayer &&
          (verticesEqual(b.position, e.from) || verticesEqual(b.position, e.to))
      );
      const connectedRoad = roads.some(
        (r) =>
          r.playerId === selectedPlayer &&
          (verticesEqual(r.position.from, e.from) ||
            verticesEqual(r.position.to, e.from) ||
            verticesEqual(r.position.from, e.to) ||
            verticesEqual(r.position.to, e.to))
      );
      return connectedBuilding || connectedRoad;
    });
  }, [selectedTool, selectedPlayer, buildings, roads, hexTiles]);

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

  const handleVertexClick = useCallback(
    (vertex: Vertex) => {
      if (selectedTool === 'building' && selectedPlayer) {
        const existingBuilding = buildings.find((b) =>
          verticesEqual(b.position, vertex)
        );

        if (existingBuilding) {
          // Remove existing building
          setBuildings((prev) => prev.filter((b) => b !== existingBuilding));
        } else {
          const adjHexes = getAdjacentHexes(vertex, hexTiles, 60);
          // 陸タイルに面していない場合は設置不可
          if (!adjHexes.some((h) => h.type !== 'ocean')) return;
          const adjacent = getAdjacentVertices(vertex, hexTiles, 60);
          const blocked = buildings.some((b) =>
            adjacent.some((v) => verticesEqual(b.position, v))
          );
          if (blocked) return;

          const buildingCount = buildings.filter((b) => b.playerId === selectedPlayer).length;
          const hasOwnRoad = roads.some(
            (r) =>
              r.playerId === selectedPlayer &&
              (verticesEqual(r.position.from, vertex) || verticesEqual(r.position.to, vertex))
          );
          if (buildingCount >= 2 && !hasOwnRoad) return;

          const newBuilding: Building = {
            type: selectedBuildingType,
            position: vertex,
            playerId: selectedPlayer,
          };
          setBuildings((prev) => [...prev, newBuilding]);
        }
      }
    },
    [selectedTool, selectedPlayer, selectedBuildingType, buildings, hexTiles, roads]
  );

  const handleEdgeClick = useCallback(
    (edge: Edge) => {
      if (selectedTool === 'road' && selectedPlayer) {
        const buildingCount = buildings.filter((b) => b.playerId === selectedPlayer).length;
        if (buildingCount === 0) {
          alert('先に家を置いてください');
          return;
        }
        const existingRoad = roads.find(
          (r) =>
            (verticesEqual(r.position.from, edge.from) &&
              verticesEqual(r.position.to, edge.to)) ||
            (verticesEqual(r.position.from, edge.to) &&
              verticesEqual(r.position.to, edge.from))
        );

        if (existingRoad) {
          // Remove existing road
          setRoads((prev) => prev.filter((r) => r !== existingRoad));
        } else {
          const connectedBuilding = buildings.some(
            (b) =>
              b.playerId === selectedPlayer &&
              (verticesEqual(b.position, edge.from) ||
                verticesEqual(b.position, edge.to))
          );
          const connectedRoad = roads.some(
            (r) =>
              r.playerId === selectedPlayer &&
              (verticesEqual(r.position.from, edge.from) ||
                verticesEqual(r.position.to, edge.from) ||
                verticesEqual(r.position.from, edge.to) ||
                verticesEqual(r.position.to, edge.to))
          );

          if (!connectedBuilding && !connectedRoad) return;

          const newRoad: Road = {
            position: edge,
            playerId: selectedPlayer,
          };
          setRoads((prev) => [...prev, newRoad]);
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
  }, [selectedTool, selectedPlayer, roads, buildings, harbors, selectedHarbor, hexTiles]);

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

  // text 要素の computed style を inline 化することで
  // SVG を画像変換しても文字サイズが変わらないようにする
  const inlineTextStyles = (svg: SVGSVGElement) => {
    const texts = svg.querySelectorAll('text');
    texts.forEach((t) => {
      const style = window.getComputedStyle(t);
      t.setAttribute('font-size', style.fontSize);
      t.setAttribute('font-family', style.fontFamily);
      t.setAttribute('font-weight', style.fontWeight);
    });
  };

  const exportBoard = () => {
    // svg を画像化してダウンロードする
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // Tailwind のクラスによる文字サイズを保持するため事前に inline 化
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
      ctx.fillStyle = '#ffffff'; // 背景を白にして透過を防ぐ
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
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
            highlightVertices={availableVertices}
            highlightEdges={availableEdges}
            size={60}
            ref={svgRef}
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
