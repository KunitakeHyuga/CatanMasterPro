import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { HexTile, ResourceType, Harbor, HarborType, BoardSetup } from '../../models/types';
import { HexBoard } from './HexBoard';
import { Shuffle, RotateCcw, Save, Download, Upload } from 'lucide-react';

const resourceTypes: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'desert', 'ocean'];
const harborTypes: HarborType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'ocean', 'any'];
const numberTokens = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

interface BoardEditorProps {
  initialBoard?: BoardSetup;
  onSave: (board: BoardSetup) => void;
  onCancel: () => void;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  initialBoard,
  onSave,
  onCancel
}) => {
  const [hexTiles, setHexTiles] = useState<HexTile[]>(
    initialBoard?.hexTiles || generateStandardBoard()
  );
  const [harbors, setHarbors] = useState<Harbor[]>(
    initialBoard?.harbors || generateStandardHarbors()
  );
  const [robberPosition, setRobberPosition] = useState(
    initialBoard?.robberPosition || { x: 2, y: 2 }
  );
  const [selectedTool, setSelectedTool] = useState<'resource' | 'number' | 'harbor' | 'robber'>('resource');
  const [selectedResource, setSelectedResource] = useState<ResourceType>('wood');
  const [selectedNumber, setSelectedNumber] = useState<number>(6);
  const [selectedHarbor, setSelectedHarbor] = useState<HarborType>('any');

  const handleHexClick = useCallback((hex: HexTile) => {
    if (selectedTool === 'resource') {
      setHexTiles(prev => prev.map(h => 
        h.id === hex.id 
          ? { ...h, type: selectedResource, number: selectedResource === 'desert' ? undefined : h.number }
          : h
      ));
    } else if (selectedTool === 'number' && hex.type !== 'desert') {
      setHexTiles(prev => prev.map(h => 
        h.id === hex.id ? { ...h, number: selectedNumber } : h
      ));
    } else if (selectedTool === 'robber') {
      setRobberPosition({ x: hex.position.x, y: hex.position.y });
    }
  }, [selectedTool, selectedResource, selectedNumber]);

  const randomizeBoard = () => {
    const shuffledResources = [...resourceTypes.slice(0, -1), ...resourceTypes.slice(0, -1), ...resourceTypes.slice(0, -1), 'desert']
      .sort(() => Math.random() - 0.5);
    const shuffledNumbers = [...numberTokens].sort(() => Math.random() - 0.5);
    
    let numberIndex = 0;
    const newHexes = hexTiles.map((hex, index) => ({
      ...hex,
      type: shuffledResources[index] as ResourceType,
      number: shuffledResources[index] === 'desert' ? undefined : shuffledNumbers[numberIndex++]
    }));
    
    setHexTiles(newHexes);
    setHarbors(generateStandardHarbors());
  };

  const resetBoard = () => {
    setHexTiles(generateStandardBoard());
    setHarbors(generateStandardHarbors());
    setRobberPosition({ x: 2, y: 2 });
  };

  const exportBoard = () => {
    const boardData = {
      hexTiles,
      harbors,
      robberPosition,
      numberTokens: [],
      buildings: [],
      roads: []
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
      numberTokens: [],
      buildings: [],
      roads: []
    };
    onSave(board);
  };

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
                  { key: 'robber', label: '盗賊' }
                ].map(tool => (
                  <Button
                    key={tool.key}
                    variant={selectedTool === tool.key ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTool(tool.key as any)}
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
            robberPosition={robberPosition}
            onHexClick={handleHexClick}
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

// ヘルパー関数
function generateStandardBoard(): HexTile[] {
  const hexes: HexTile[] = [];
  
  // カタンボードの標準配置（19個のタイル）
  const boardLayout = [
    // 行0: 3個
    { x: 0, y: 0, resource: 'ore', number: 10 },
    { x: 1, y: 0, resource: 'sheep', number: 2 },
    { x: 2, y: 0, resource: 'wood', number: 9 },
    
    // 行1: 4個
    { x: 0, y: 1, resource: 'wheat', number: 12 },
    { x: 1, y: 1, resource: 'brick', number: 6 },
    { x: 2, y: 1, resource: 'sheep', number: 4 },
    { x: 3, y: 1, resource: 'brick', number: 10 },
    
    // 行2: 5個（中央行）
    { x: 0, y: 2, resource: 'wheat', number: 9 },
    { x: 1, y: 2, resource: 'wood', number: 11 },
    { x: 2, y: 2, resource: 'desert', number: undefined },
    { x: 3, y: 2, resource: 'wood', number: 3 },
    { x: 4, y: 2, resource: 'ore', number: 8 },
    
    // 行3: 4個
    { x: 0, y: 3, resource: 'wood', number: 8 },
    { x: 1, y: 3, resource: 'ore', number: 3 },
    { x: 2, y: 3, resource: 'wheat', number: 4 },
    { x: 3, y: 3, resource: 'sheep', number: 5 },
    
    // 行4: 3個
    { x: 1, y: 4, resource: 'brick', number: 5 },
    { x: 2, y: 4, resource: 'wheat', number: 6 },
    { x: 3, y: 4, resource: 'sheep', number: 11 }
  ];
  
  boardLayout.forEach((tile, index) => {
    hexes.push({
      id: `hex-${index}`,
      type: tile.resource as ResourceType,
      number: tile.number,
      position: { x: tile.x, y: tile.y }
    });
  });
  
  return hexes;
}

function generateStandardHarbors(): Harbor[] {
  return [
    // 港の配置（海タイルの位置に対応）
    { type: 'any', position: { x: -1, y: -1 } },
    { type: 'wood', position: { x: 1, y: -2 } },
    { type: 'any', position: { x: 3, y: -1 } },
    { type: 'brick', position: { x: 4, y: 1 } },
    { type: 'any', position: { x: 4, y: 2 } },
    { type: 'wheat', position: { x: 3, y: 3 } },
    { type: 'any', position: { x: 1, y: 4 } },
    { type: 'ore', position: { x: -1, y: 3 } },
    { type: 'sheep', position: { x: -2, y: 1 } }
  ];
}