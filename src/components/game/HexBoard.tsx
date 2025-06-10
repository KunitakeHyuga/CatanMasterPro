import React, { useState } from 'react';
import { HexTile, ResourceType, Building, Road, PlayerColor, Vertex, Edge } from '../../models/types';

interface HexProps {
  hex: HexTile;
  size?: number;
  buildings: Building[];
  roads: Road[];
  playerColors: Record<string, PlayerColor>;
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (id: string) => void;
  onHexRightClick?: (id: string) => void;
}

const resourceColors: Record<ResourceType, string> = {
  wood: 'bg-emerald-700', // Dark green for forests
  brick: 'bg-red-600', // Red for hills/brick
  sheep: 'bg-green-400', // Light green for pastures
  wheat: 'bg-yellow-400', // Yellow for fields
  ore: 'bg-gray-500', // Gray for mountains
  desert: 'bg-yellow-200', // Light yellow for desert
};

const resourceNames: Record<ResourceType, string> = {
  wood: 'Forest',
  brick: 'Hills',
  sheep: 'Pasture',
  wheat: 'Fields',
  ore: 'Mountains',
  desert: 'Desert',
};

const Hex: React.FC<HexProps> = ({ 
  hex, 
  size = 70,
  buildings,
  roads,
  playerColors,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  onHexRightClick
}) => {
  const hexHeight = size * 2;
  const hexWidth = Math.sqrt(3) * size;
  
  // Calculate vertices for the hexagon
  const vertices: Vertex[] = [
    { x: 0, y: size },
    { x: hexWidth / 2, y: 0 },
    { x: hexWidth, y: size },
    { x: hexWidth, y: size + size },
    { x: hexWidth / 2, y: hexHeight },
    { x: 0, y: size + size },
  ];

  // Create edges between vertices
  const edges: Edge[] = vertices.map((vertex, i) => ({
    from: vertex,
    to: vertices[(i + 1) % vertices.length]
  }));

  const textColor = hex.type === 'desert' || hex.type === 'sheep' || hex.type === 'wheat' 
    ? 'text-gray-800' 
    : 'text-white';

  return (
    <div className="relative inline-block" style={{ width: hexWidth, height: hexHeight }}>
      {/* Base hexagon */}
      <svg width={hexWidth} height={hexHeight} className="absolute top-0 left-0">
        <polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
          className={`${resourceColors[hex.type]} stroke-gray-600 cursor-pointer`}
          strokeWidth="2"
          onClick={() => onHexClick?.(hex.id)}
          onContextMenu={e => {
            e.preventDefault();
            onHexRightClick?.(hex.id);
          }}
        />
        
        {/* Draw roads */}
        {roads.map((road, index) => (
          <line
            key={`road-${index}`}
            x1={road.position.from.x}
            y1={road.position.from.y}
            x2={road.position.to.x}
            y2={road.position.to.y}
            stroke={playerColors[road.playerId]}
            strokeWidth="4"
            className="stroke-current"
          />
        ))}
        
        {/* Draw buildings */}
        {buildings.map((building, index) => {
          const color = playerColors[building.playerId];
          return building.type === 'settlement' ? (
            <circle
              key={`building-${index}`}
              cx={building.position.x}
              cy={building.position.y}
              r="6"
              fill={color}
              className="stroke-white"
              strokeWidth="2"
            />
          ) : (
            <rect
              key={`building-${index}`}
              x={building.position.x - 8}
              y={building.position.y - 8}
              width="16"
              height="16"
              fill={color}
              className="stroke-white"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Clickable vertices */}
        {vertices.map((vertex, index) => (
          <circle
            key={`vertex-${index}`}
            cx={vertex.x}
            cy={vertex.y}
            r="8"
            className="fill-transparent hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer"
            onClick={() => onVertexClick?.(vertex)}
          />
        ))}
        
        {/* Clickable edges */}
        {edges.map((edge, index) => {
          const midX = (edge.from.x + edge.to.x) / 2;
          const midY = (edge.from.y + edge.to.y) / 2;
          const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
          
          return (
            <rect
              key={`edge-${index}`}
              x={midX - 12}
              y={midY - 4}
              width="24"
              height="8"
              transform={`rotate(${angle * 180 / Math.PI} ${midX} ${midY})`}
              className="fill-transparent hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer"
              onClick={() => onEdgeClick?.(edge)}
            />
          );
        })}
      </svg>
      
      {/* Resource and number display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-xs font-medium ${textColor}`}>
          {resourceNames[hex.type]}
        </div>
        {hex.number && (
          <div 
            className={`mt-1 ${
              hex.number === 6 || hex.number === 8 ? 'text-red-600 font-bold' : textColor
            } text-base font-semibold`}
          >
            {hex.number}
          </div>
        )}
      </div>
    </div>
  );
};

interface HexBoardProps {
  hexes: HexTile[];
  buildings?: Building[];
  roads?: Road[];
  playerColors?: Record<string, PlayerColor>;
  className?: string;
  size?: number;
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (id: string) => void;
  onHexRightClick?: (id: string) => void;
}

export const HexBoard: React.FC<HexBoardProps> = ({ 
  hexes,
  buildings = [],
  roads = [],
  playerColors = {},
  className = "",
  size = 70,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  onHexRightClick
}) => {
  const hexWidth = Math.sqrt(3) * size;
  const hexHeight = size * 2;
  const rowOffset = hexHeight * 0.75;
  
  // Group hexes by row
  const hexesByRow: { [key: number]: HexTile[] } = {};
  hexes.forEach(hex => {
    const { y } = hex.position;
    if (!hexesByRow[y]) {
      hexesByRow[y] = [];
    }
    hexesByRow[y].push(hex);
  });

  // Sort rows and hexes within rows
  const sortedRows = Object.keys(hexesByRow)
    .map(Number)
    .sort((a, b) => a - b);
  
  sortedRows.forEach(rowIndex => {
    hexesByRow[rowIndex].sort((a, b) => a.position.x - b.position.x);
  });

  return (
    <div className={`relative ${className}`}>
      {sortedRows.map((rowIndex, rowIdx) => (
        <div 
          key={`row-${rowIndex}`} 
          className="flex"
          style={{
            marginTop: rowIdx > 0 ? -rowOffset : 0,
            marginLeft: rowIndex % 2 === 1 ? hexWidth / 2 : 0,
            zIndex: sortedRows.length - rowIdx
          }}
        >
          {hexesByRow[rowIndex].map(hex => (
            <div 
              key={hex.id} 
              style={{ marginRight: -10 }}
            >
              <Hex 
                hex={hex} 
                size={size}
                buildings={buildings.filter(b => 
                  Math.abs(b.position.x - hex.position.x) < 1 &&
                  Math.abs(b.position.y - hex.position.y) < 1
                )}
                roads={roads.filter(r => 
                  Math.abs(r.position.from.x - hex.position.x) < 1 &&
                  Math.abs(r.position.from.y - hex.position.y) < 1
                )}
                playerColors={playerColors}
                onVertexClick={onVertexClick}
                onEdgeClick={onEdgeClick}
                onHexClick={onHexClick}
                onHexRightClick={onHexRightClick}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};