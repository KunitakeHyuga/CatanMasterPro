import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BoardSetup, HexTile, ResourceType, Harbor } from '../../models/types';
import { HexBoard } from './HexBoard';
import { generateDefaultBoard } from '../../utils/board';

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
      board: generateDefaultBoard('standard')
    },
    {
      name: '航海者版',
      description: '海を舞台にした拡張版',
      board: generateDefaultBoard('seafarers')
    },
    {
      name: '都市と騎士版',
      description: '騎士や都市が登場する戦略的ゲーム',
      board: generateDefaultBoard('cities')
    },
    {
      name: '商人と蛮族版',
      description: '商人と蛮族が登場する交易重視ゲーム',
      board: generateDefaultBoard('traders')
    },
    {
      name: 'アメリカ大陸版',
      description: 'アメリカ大陸を舞台にした独立ゲーム',
      board: generateDefaultBoard('america')
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
function generateBeginnerBoard(): BoardSetup {
  const board = generateDefaultBoard('standard');
  // 初心者向けの数字配置
  const beginnerNumbers = [6, 8, 5, 9, 4, 10, 3, 11, 2, 12, 6, 8, 5, 9, 4, 10, 3, 11];
  
  let numberIndex = 0;
  board.hexTiles.forEach(hex => {
    if (hex.type !== 'desert' && hex.type !== 'ocean') {
      hex.number = beginnerNumbers[numberIndex++];
    }
  });
  
  return board;
}

function generateBalancedBoard(): BoardSetup {
  const board = generateDefaultBoard('standard');
  
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
  
  let resourceIndex = 0;
  let numberIndex = 0;
  board.hexTiles.forEach((hex) => {
    if (hex.type !== 'ocean') {
      hex.type = shuffledResources[resourceIndex++];
      if (hex.type !== 'desert') {
        hex.number = balancedNumbers[numberIndex++];
      } else {
        hex.number = undefined;
      }
    }
  });
  
  return board;
}

function generateResourceRichBoard(): BoardSetup {
  const board = generateDefaultBoard('standard');
  
  // より高確率の数字を多く配置
  const richNumbers = [6, 8, 5, 9, 6, 8, 5, 9, 4, 10, 4, 10, 3, 11, 3, 11, 2, 12];
  
  let numberIndex = 0;
  board.hexTiles.forEach(hex => {
    if (hex.type !== 'desert' && hex.type !== 'ocean') {
      hex.number = richNumbers[numberIndex++];
    }
  });
  
  return board;
}