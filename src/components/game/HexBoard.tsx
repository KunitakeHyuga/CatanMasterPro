import React from 'react';
import { HexTile, ResourceType, Building, Road, PlayerColor, Vertex, Edge, Harbor } from '../../models/types';

interface HexProps {
  hex: HexTile;
  size?: number;
  buildings: Building[];
  roads: Road[];
  harbors: Harbor[];
  playerColors: Record<string, PlayerColor>;
  robberPosition?: { x: number; y: number };
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (hex: HexTile) => void;
  isInteractive?: boolean;
}

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

const Hex: React.FC<HexProps> = ({ 
  hex, 
  size = 70,
  buildings,
  roads,
  harbors,
  playerColors,
  robberPosition,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false
}) => {
  const hexHeight = size * 2;
  const hexWidth = Math.sqrt(3) * size;
  
  // Calculate center position
  const centerX = (hex.position.x * hexWidth * 0.75) + hexWidth / 2;
  const centerY = (hex.position.y * hexHeight * 0.5) + hexHeight / 2;
  
  // Calculate vertices for the hexagon
  const vertices: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    vertices.push({
      x: centerX + size * Math.cos(angle),
      y: centerY + size * Math.sin(angle)
    });
  }

  // Create edges between vertices
  const edges: Edge[] = vertices.map((vertex, i) => ({
    from: vertex,
    to: vertices[(i + 1) % vertices.length]
  }));

  const textColor = hex.type === 'desert' || hex.type === 'sheep' || hex.type === 'wheat' 
    ? '#374151' 
    : '#ffffff';

  const isRobber = robberPosition && 
    robberPosition.x === hex.position.x && 
    robberPosition.y === hex.position.y;

  return (
    <g>
      {/* Base hexagon */}
      <polygon 
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
        fill={resourceColors[hex.type]}
        stroke="#374151" 
        strokeWidth="2"
        className={isInteractive ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onHexClick?.(hex)}
      />
      
      {/* Resource label */}
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        fill={textColor}
        className="text-xs font-medium pointer-events-none"
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
            fill={hex.number === 6 || hex.number === 8 ? '#dc2626' : '#374151'}
            className="text-sm font-bold pointer-events-none"
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
      
      {/* Draw roads */}
      {roads.map((road, index) => (
        <line
          key={`road-${index}`}
          x1={road.position.from.x}
          y1={road.position.from.y}
          x2={road.position.to.x}
          y2={road.position.to.y}
          stroke={playerColors[road.playerId] || '#000000'}
          strokeWidth="4"
        />
      ))}
      
      {/* Draw buildings */}
      {buildings.map((building, index) => {
        const color = playerColors[building.playerId] || '#000000';
        return building.type === 'settlement' ? (
          <circle
            key={`building-${index}`}
            cx={building.position.x}
            cy={building.position.y}
            r="6"
            fill={color}
            stroke="#ffffff"
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
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}
      
      {/* Clickable vertices for interactive mode */}
      {isInteractive && vertices.map((vertex, index) => (
        <circle
          key={`vertex-${index}`}
          cx={vertex.x}
          cy={vertex.y}
          r="8"
          fill="transparent"
          className="hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer"
          onClick={() => onVertexClick?.(vertex)}
        />
      ))}
      
      {/* Clickable edges for interactive mode */}
      {isInteractive && edges.map((edge, index) => {
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
            fill="transparent"
            className="hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer"
            onClick={() => onEdgeClick?.(edge)}
          />
        );
      })}
    </g>
  );
};

interface HexBoardProps {
  hexes: HexTile[];
  buildings?: Building[];
  roads?: Road[];
  harbors?: Harbor[];
  playerColors?: Record<string, PlayerColor>;
  robberPosition?: { x: number; y: number };
  className?: string;
  size?: number;
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (hex: HexTile) => void;
  isInteractive?: boolean;
}

export const HexBoard: React.FC<HexBoardProps> = ({ 
  hexes,
  buildings = [],
  roads = [],
  harbors = [],
  playerColors = {},
  robberPosition,
  className = "",
  size = 70,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false
}) => {
  const hexWidth = Math.sqrt(3) * size;
  const hexHeight = size * 2;
  
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

  // Calculate board dimensions
  const boardWidth = hexWidth * 6;
  const boardHeight = hexHeight * 4;

  return (
    <div className={`relative ${className}`}>
      <svg width={boardWidth} height={boardHeight} className="border rounded-lg">
        {/* Render all hexes */}
        {hexes.map(hex => (
          <Hex 
            key={hex.id}
            hex={hex} 
            size={size}
            buildings={buildings.filter(b => 
              Math.abs(b.position.x - hex.position.x) < size &&
              Math.abs(b.position.y - hex.position.y) < size
            )}
            roads={roads.filter(r => 
              Math.abs(r.position.from.x - hex.position.x) < size &&
              Math.abs(r.position.from.y - hex.position.y) < size
            )}
            harbors={harbors}
            playerColors={playerColors}
            robberPosition={robberPosition}
            onVertexClick={onVertexClick}
            onEdgeClick={onEdgeClick}
            onHexClick={onHexClick}
            isInteractive={isInteractive}
          />
        ))}
        
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
                fill="#ffffff"
                className="text-xs font-medium pointer-events-none"
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