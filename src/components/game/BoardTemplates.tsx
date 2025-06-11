import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BoardSetup, HexTile, ResourceType, Harbor } from '../../models/types';
import { HexBoard } from './HexBoard';

interface BoardTemplatesProps {
  onSelectTemplate: (board: BoardSetup) => void;
  savedBoards: BoardSetup[];
}

export const BoardTemplates: React.FC<BoardTemplatesProps> = ({
  onSelectTemplate,
  savedBoards
}) => {
  const standardTemplates = [
    {
      name: '標準カタン',
      description: 'クラシックなカタンボードレイアウト',
      board: generateStandardCatanBoard()
    },
    {
      name: '初心者向け',
      description: '新しいプレイヤーにおすすめの設定',
      board: generateBeginnerBoard()
    },
    {
      name: 'バランス型',
      description: '均等に分散されたリソース',
      board: generateBalancedBoard()
    },
    {
      name: 'リソース豊富',
      description: 'より多くのリソース、高速ゲームプレイ',
      board: generateResourceRichBoard()
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>標準テンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template.board)}
                  >
                    使用する
                  </Button>
                </div>
                <div className="flex justify-center">
                  <HexBoard 
                    hexes={template.board.hexTiles} 
                    harbors={template.board.harbors}
                    size={25}
                    className="transform scale-75"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {savedBoards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>保存済みボード</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBoards.map((board, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {board.name || `カスタムボード ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-500">カスタムボード設定</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectTemplate(board)}
                    >
                      使用する
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <HexBoard 
                      hexes={board.hexTiles} 
                      harbors={board.harbors}
                      size={25}
                      className="transform scale-75"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// テンプレート生成関数
function generateStandardCatanBoard(): BoardSetup {
  const hexes: HexTile[] = [];
  
  // 標準カタンボードの配置
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

  const harbors: Harbor[] = [
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
  
  return {
    hexTiles: hexes,
    harbors,
    robberPosition: { x: 2, y: 2 },
    numberTokens: [],
    buildings: [],
    roads: []
  };
}

function generateBeginnerBoard(): BoardSetup {
  const board = generateStandardCatanBoard();
  // 初心者向けの数字配置
  const beginnerNumbers = [6, 8, 5, 9, 4, 10, 3, 11, 2, 12, 6, 8, 5, 9, 4, 10, 3, 11];
  
  let numberIndex = 0;
  board.hexTiles.forEach(hex => {
    if (hex.type !== 'desert') {
      hex.number = beginnerNumbers[numberIndex++];
    }
  });
  
  return board;
}

function generateBalancedBoard(): BoardSetup {
  const board = generateStandardCatanBoard();
  
  // バランスの取れたリソース配置
  const resources: ResourceType[] = [
    'wood', 'wood', 'wood', 'wood',
    'brick', 'brick', 'brick',
    'sheep', 'sheep', 'sheep', 'sheep',
    'wheat', 'wheat', 'wheat', 'wheat',
    'ore', 'ore', 'ore',
    'desert'
  ];
  
  const shuffledResources = resources.sort(() => Math.random() - 0.5);
  const balancedNumbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  
  let numberIndex = 0;
  board.hexTiles.forEach((hex, index) => {
    hex.type = shuffledResources[index];
    if (hex.type !== 'desert') {
      hex.number = balancedNumbers[numberIndex++];
    } else {
      hex.number = undefined;
    }
  });
  
  return board;
}

function generateResourceRichBoard(): BoardSetup {
  const board = generateStandardCatanBoard();
  
  // より高確率の数字を多く配置
  const richNumbers = [6, 8, 5, 9, 6, 8, 5, 9, 4, 10, 4, 10, 3, 11, 3, 11, 2, 12];
  
  let numberIndex = 0;
  board.hexTiles.forEach(hex => {
    if (hex.type !== 'desert') {
      hex.number = richNumbers[numberIndex++];
    }
  });
  
  return board;
}