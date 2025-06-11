import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { HexTile, ResourceType, Harbor, HarborType, BoardSetup } from '../../models/types';
import { Shuffle, RotateCcw, Save, Download, Upload } from 'lucide-react';

const resourceTypes: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'desert'];
const harborTypes: HarborType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'any'];
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
      {/* Tools Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Board Editor Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tool Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'resource', label: 'Resources' },
                  { key: 'number', label: 'Numbers' },
                  { key: 'harbor', label: 'Harbors' },
                  { key: 'robber', label: 'Robber' }
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

            {/* Resource Selection */}
            {selectedTool === 'resource' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resource
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
                      {resource}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Number Selection */}
            {selectedTool === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Number
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

            {/* Harbor Selection */}
            {selectedTool === 'harbor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Harbor Type
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={randomizeBoard}
                icon={<Shuffle size={16} />}
              >
                Randomize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetBoard}
                icon={<RotateCcw size={16} />}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportBoard}
                icon={<Download size={16} />}
              >
                Export
              </Button>
              <label className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  icon={<Upload size={16} />}
                >
                  Import
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

      {/* Board Display */}
      <Card>
        <CardHeader>
          <CardTitle>Board Layout</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <InteractiveBoardDisplay
            hexTiles={hexTiles}
            harbors={harbors}
            robberPosition={robberPosition}
            onHexClick={handleHexClick}
            selectedTool={selectedTool}
          />
        </CardContent>
      </Card>

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} icon={<Save size={16} />}>
          Save Board
        </Button>
      </div>
    </div>
  );
};

// Interactive Board Display Component
interface InteractiveBoardDisplayProps {
  hexTiles: HexTile[];
  harbors: Harbor[];
  robberPosition: { x: number; y: number };
  onHexClick: (hex: HexTile) => void;
  selectedTool: string;
}

const InteractiveBoardDisplay: React.FC<InteractiveBoardDisplayProps> = ({
  hexTiles,
  harbors,
  robberPosition,
  onHexClick,
  selectedTool
}) => {
  const size = 60;
  const hexHeight = size * 2;
  const hexWidth = Math.sqrt(3) * size;
  
  const resourceColors: Record<ResourceType, string> = {
    wood: '#10b981', // emerald-500
    brick: '#dc2626', // red-600
    sheep: '#22c55e', // green-500
    wheat: '#eab308', // yellow-500
    ore: '#6b7280', // gray-500
    desert: '#fbbf24', // amber-400
  };

  const resourceNames: Record<ResourceType, string> = {
    wood: 'Forest',
    brick: 'Hills',
    sheep: 'Pasture',
    wheat: 'Fields',
    ore: 'Mountains',
    desert: 'Desert',
  };

  // Group hexes by row for proper layout
  const hexesByRow: { [key: number]: HexTile[] } = {};
  hexTiles.forEach(hex => {
    const { y } = hex.position;
    if (!hexesByRow[y]) hexesByRow[y] = [];
    hexesByRow[y].push(hex);
  });

  const sortedRows = Object.keys(hexesByRow)
    .map(Number)
    .sort((a, b) => a - b);

  sortedRows.forEach(rowIndex => {
    hexesByRow[rowIndex].sort((a, b) => a.position.x - b.position.x);
  });

  return (
    <div className="relative">
      <svg width={hexWidth * 6} height={hexHeight * 4} className="border rounded-lg">
        {/* Render hexes */}
        {sortedRows.map(rowIndex => 
          hexesByRow[rowIndex].map(hex => {
            const centerX = (hex.position.x * hexWidth * 0.75) + hexWidth / 2;
            const centerY = (hex.position.y * hexHeight * 0.5) + hexHeight / 2;
            
            // Calculate hex vertices
            const vertices = [];
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = centerX + size * Math.cos(angle);
              const y = centerY + size * Math.sin(angle);
              vertices.push(`${x},${y}`);
            }

            const isRobber = robberPosition.x === hex.position.x && robberPosition.y === hex.position.y;
            const isHighlighted = selectedTool === 'robber' || selectedTool === 'resource' || selectedTool === 'number';

            return (
              <g key={hex.id}>
                {/* Hex polygon */}
                <polygon
                  points={vertices.join(' ')}
                  fill={resourceColors[hex.type]}
                  stroke="#374151"
                  strokeWidth="2"
                  className={`cursor-pointer transition-opacity ${
                    isHighlighted ? 'hover:opacity-80' : ''
                  }`}
                  onClick={() => onHexClick(hex)}
                />
                
                {/* Resource label */}
                <text
                  x={centerX}
                  y={centerY - 8}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium pointer-events-none"
                >
                  {resourceNames[hex.type]}
                </text>
                
                {/* Number token */}
                {hex.number && (
                  <>
                    <circle
                      cx={centerX}
                      cy={centerY + 8}
                      r="12"
                      fill="#f3f4f6"
                      stroke="#374151"
                      strokeWidth="1"
                      className="pointer-events-none"
                    />
                    <text
                      x={centerX}
                      y={centerY + 12}
                      textAnchor="middle"
                      className={`text-sm font-bold pointer-events-none ${
                        hex.number === 6 || hex.number === 8 ? 'fill-red-600' : 'fill-gray-800'
                      }`}
                    >
                      {hex.number}
                    </text>
                  </>
                )}
                
                {/* Robber */}
                {isRobber && (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="8"
                    fill="#1f2937"
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })
        )}
        
        {/* Render harbors */}
        {harbors.map((harbor, index) => {
          const centerX = (harbor.position.x * hexWidth * 0.75) + hexWidth / 2;
          const centerY = (harbor.position.y * hexHeight * 0.5) + hexHeight / 2;
          
          return (
            <g key={`harbor-${index}`}>
              <rect
                x={centerX - 15}
                y={centerY - 8}
                width="30"
                height="16"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={centerX}
                y={centerY + 3}
                textAnchor="middle"
                className="fill-white text-xs font-medium pointer-events-none"
              >
                {harbor.type === 'any' ? '3:1' : '2:1'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Helper functions
function generateStandardBoard(): HexTile[] {
  const hexes: HexTile[] = [];
  const layout = [3, 4, 5, 4, 3];
  const standardResources: ResourceType[] = [
    'ore', 'sheep', 'wood',
    'wheat', 'brick', 'sheep', 'brick',
    'wheat', 'wood', 'desert', 'wood', 'ore',
    'wood', 'ore', 'wheat', 'sheep',
    'brick', 'wheat', 'sheep'
  ];
  const standardNumbers = [10, 2, 9, 12, 6, 4, 10, 9, 11, 3, 8, 8, 3, 4, 5, 5, 6, 11];
  
  let hexIndex = 0;
  layout.forEach((rowSize, rowIndex) => {
    const xOffset = (5 - rowSize) / 2;
    
    for (let x = 0; x < rowSize; x++) {
      const resource = standardResources[hexIndex];
      const number = resource === 'desert' ? undefined : standardNumbers[hexIndex];
      
      hexes.push({
        id: `hex-${hexIndex}`,
        type: resource,
        number,
        position: { x: x + xOffset, y: rowIndex }
      });
      
      hexIndex++;
    }
  });
  
  return hexes;
}

function generateStandardHarbors(): Harbor[] {
  return [
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
}