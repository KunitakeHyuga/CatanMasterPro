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
      name: 'Standard Catan',
      description: 'The classic Catan board layout',
      board: generateStandardCatanBoard()
    },
    {
      name: 'Beginner Setup',
      description: 'Recommended setup for new players',
      board: generateBeginnerBoard()
    },
    {
      name: 'Balanced Resources',
      description: 'Evenly distributed resources',
      board: generateBalancedBoard()
    },
    {
      name: 'Resource Rich',
      description: 'More resources, faster gameplay',
      board: generateResourceRichBoard()
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standard Templates</CardTitle>
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
                    Use Template
                  </Button>
                </div>
                <div className="flex justify-center">
                  <HexBoard 
                    hexes={template.board.hexTiles} 
                    size={30}
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
            <CardTitle>Your Saved Boards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBoards.map((board, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {board.name || `Custom Board ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-500">Custom board setup</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectTemplate(board)}
                    >
                      Use Board
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <HexBoard 
                      hexes={board.hexTiles} 
                      size={30}
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

// Template generation functions
function generateStandardCatanBoard(): BoardSetup {
  const hexes: HexTile[] = [];
  const layout = [3, 4, 5, 4, 3];
  const resources: ResourceType[] = [
    'ore', 'sheep', 'wood',
    'wheat', 'brick', 'sheep', 'brick',
    'wheat', 'wood', 'desert', 'wood', 'ore',
    'wood', 'ore', 'wheat', 'sheep',
    'brick', 'wheat', 'sheep'
  ];
  const numbers = [10, 2, 9, 12, 6, 4, 10, 9, 11, 3, 8, 8, 3, 4, 5, 5, 6, 11];
  
  let hexIndex = 0;
  layout.forEach((rowSize, rowIndex) => {
    const xOffset = (5 - rowSize) / 2;
    
    for (let x = 0; x < rowSize; x++) {
      const resource = resources[hexIndex];
      const number = resource === 'desert' ? undefined : numbers[hexIndex];
      
      hexes.push({
        id: `hex-${hexIndex}`,
        type: resource,
        number,
        position: { x: x + xOffset, y: rowIndex }
      });
      
      hexIndex++;
    }
  });

  const harbors: Harbor[] = [
    { type: 'any', position: { x: 0, y: 0 } },
    { type: 'wood', position: { x: 1, y: 0 } },
    { type: 'any', position: { x: 3, y: 0 } },
    { type: 'brick', position: { x: 4, y: 1 } },
    { type: 'any', position: { x: 4, y: 3 } },
    { type: 'wheat', position: { x: 3, y: 4 } },
    { type: 'any', position: { x: 1, y: 4 } },
    { type: 'ore', position: { x: 0, y: 3 } },
    { type: 'sheep', position: { x: 0, y: 1 } }
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
  // Modify for beginner-friendly setup
  const beginnerNumbers = [6, 8, 5, 9, 4, 10, 3, 11, 2, 12, 6, 8, 5, 9, 4, 10, 3, 11];
  
  board.hexTiles.forEach((hex, index) => {
    if (hex.type !== 'desert') {
      hex.number = beginnerNumbers[index];
    }
  });
  
  return board;
}

function generateBalancedBoard(): BoardSetup {
  const board = generateStandardCatanBoard();
  
  // Shuffle resources for balance
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
  
  // More high-probability numbers
  const richNumbers = [6, 8, 5, 9, 6, 8, 5, 9, 4, 10, 4, 10, 3, 11, 3, 11, 2, 12];
  
  let numberIndex = 0;
  board.hexTiles.forEach(hex => {
    if (hex.type !== 'desert') {
      hex.number = richNumbers[numberIndex++];
    }
  });
  
  return board;
}