import React from 'react';
import { HexTile, ResourceType, Building, Road, PlayerColor, Vertex, Edge, Harbor } from '../../models/types';

interface HexProps {
  hex: HexTile;
  size?: number;
  buildings: Building[];
  roads: Road[];
  playerColors: Record<string, PlayerColor>;
  robberPosition?: { x: number; y: number };
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (hex: HexTile) => void;
  isInteractive?: boolean;
}

// 六角形の頂点を計算（フラットトップ）
const computeVertices = (size: number): Vertex[] => {
  const verts: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    verts.push({ x: size * Math.cos(angle), y: size * Math.sin(angle) });
  }
  return verts;
};

const resourceColors: Record<ResourceType, string> = {
  wood: '#10b981', // emerald-500 - 森林
  brick: '#dc2626', // red-600 - 丘陵
  sheep: '#22c55e', // green-500 - 牧草地
  wheat: '#eab308', // yellow-500 - 農地
  ore: '#6b7280', // gray-500 - 山地
  desert: '#fbbf24', // amber-400 - 砂漠
  ocean: '#3b82f6', // blue-600 - 海
};

const resourceNames: Record<ResourceType, string> = {
  wood: '森林',
  brick: '丘陵',
  sheep: '牧草地',
  wheat: '農地',
  ore: '山地',
  desert: '砂漠',
  ocean: '海',
};

const Hex: React.FC<HexProps> = ({
  hex,
  size = 50,
  buildings,
  roads,
  playerColors,
  robberPosition,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false,
}) => {
  const vertices = computeVertices(size);
  const edges: Edge[] = vertices.map((v, i) => ({ from: v, to: vertices[(i + 1) % 6] }));

  const fill = resourceColors[hex.type];
  const textColor = hex.type === 'ocean' ? '#ffffff' : hex.type === 'desert' ? '#000000' : '#ffffff';
  
  // Check if robber is on this hex
  const hasRobber = robberPosition && 
    robberPosition.x === hex.position.x && 
    robberPosition.y === hex.position.y;

  // Filter buildings and roads for this hex
  const hexBuildings = buildings.filter(b => 
    Math.abs(b.position.x) < size && Math.abs(b.position.y) < size
  );
  
  const hexRoads = roads.filter(r => 
    Math.abs(r.position.from.x) < size * 1.5 && Math.abs(r.position.from.y) < size * 1.5
  );

  return (
    <g onClick={() => onHexClick?.(hex)} className={isInteractive ? 'cursor-pointer hover:opacity-80' : ''}>
      <polygon
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
        fill={fill}
        stroke="#374151"
        strokeWidth={2}
      />
      
      {/* リソース名 */}
      <text x={0} y={-8} textAnchor="middle" fill={textColor} className="text-xs font-medium pointer-events-none">
        {resourceNames[hex.type]}
      </text>
      
      {/* 数字トークン */}
      {hex.number && (
        <>
          <circle cx={0} cy={8} r={12} fill="#f3f4f6" stroke="#374151" strokeWidth={1} className="pointer-events-none" />
          <text x={0} y={12} textAnchor="middle" fill={hex.number === 6 || hex.number === 8 ? '#dc2626' : '#374151'} className="text-sm font-bold pointer-events-none">
            {hex.number}
          </text>
        </>
      )}
      
      {/* 盗賊 */}
      {hasRobber && hex.type !== 'ocean' && (
        <circle cx={0} cy={-20} r={8} fill="#000000" stroke="#ffffff" strokeWidth={2} className="pointer-events-none" />
      )}
      
      {/* 道路 */}
      {hexRoads.map((road, i) => (
        <line 
          key={i} 
          x1={road.position.from.x} 
          y1={road.position.from.y} 
          x2={road.position.to.x} 
          y2={road.position.to.y} 
          stroke={playerColors[road.playerId] || '#000'} 
          strokeWidth={4} 
        />
      ))}
      
      {/* 建物 */}
      {hexBuildings.map((building, i) => {
        const color = playerColors[building.playerId] || '#000';
        return building.type === 'settlement' ? (
          <circle 
            key={i} 
            cx={building.position.x} 
            cy={building.position.y} 
            r={6} 
            fill={color} 
            stroke="#fff" 
            strokeWidth={2} 
          />
        ) : (
          <rect 
            key={i} 
            x={building.position.x - 8} 
            y={building.position.y - 8} 
            width={16} 
            height={16} 
            fill={color} 
            stroke="#fff" 
            strokeWidth={2} 
          />
        );
      })}
      
      {/* インタラクティブな頂点（建物配置用） */}
      {isInteractive && vertices.map((v, i) => (
        <circle 
          key={i} 
          cx={v.x} 
          cy={v.y} 
          r={8} 
          fill="transparent" 
          className="hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onVertexClick?.(v);
          }} 
        />
      ))}
      
      {/* インタラクティブなエッジ（道路配置用） */}
      {isInteractive && edges.map((e, i) => {
        const midX = (e.from.x + e.to.x) / 2;
        const midY = (e.from.y + e.to.y) / 2;
        const angle = (Math.atan2(e.to.y - e.from.y, e.to.x - e.from.x) * 180) / Math.PI;
        return (
          <rect
            key={i}
            x={midX - 12}
            y={midY - 4}
            width={24}
            height={8}
            transform={`rotate(${angle} ${midX} ${midY})`}
            fill="transparent"
            className="hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEdgeClick?.(e);
            }}
          />
        );
      })}
    </g>
  );
};

interface HexBoardProps {
  hexes: HexTile[];
  harbors?: Harbor[];
  buildings?: Building[];
  roads?: Road[];
  robberPosition?: { x: number; y: number };
  playerColors?: Record<string, PlayerColor>;
  className?: string;
  size?: number;
  onVertexClick?: (vertex: Vertex) => void;
  onEdgeClick?: (edge: Edge) => void;
  onHexClick?: (hex: HexTile) => void;
  isInteractive?: boolean;
}

export const HexBoard: React.FC<HexBoardProps> = ({
  hexes,
  harbors = [],
  buildings = [],
  roads = [],
  robberPosition,
  playerColors = {},
  className = "",
  size = 50,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false,
}) => {
  const getHexPosition = React.useCallback((col: number, row: number) => ({
    x: col * (size * Math.sqrt(3)),
    y: row * (size * 1.5),
  }), [size]);

  // 境界計算
  const coords = hexes.map(h => getHexPosition(h.position.x, h.position.y));
  const xs = coords.map(c => c.x);
  const ys = coords.map(c => c.y);
  const minX = Math.min(...xs) - size;
  const maxX = Math.max(...xs) + size;
  const minY = Math.min(...ys) - size;
  const maxY = Math.max(...ys) + size;
  const boardWidth = maxX - minX + size * 2;
  const boardHeight = maxY - minY + size * 2;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={boardWidth}
        height={boardHeight}
        className="border rounded-lg bg-blue-50"
        viewBox={`${minX - size} ${minY - size} ${boardWidth} ${boardHeight}`}
      >
        {hexes.map(hex => {
          const { x, y } = getHexPosition(hex.position.x, hex.position.y);
          
          // Filter buildings and roads for this specific hex position
          const hexBuildings = buildings.filter(b => {
            const hexVertices = computeVertices(size);
            return hexVertices.some(v => 
              Math.abs(b.position.x - (x + v.x)) < 10 && 
              Math.abs(b.position.y - (y + v.y)) < 10
            );
          });
          
          const hexRoads = roads.filter(r => {
            const hexVertices = computeVertices(size);
            const hexEdges = hexVertices.map((v, i) => ({ 
              from: { x: x + v.x, y: y + v.y }, 
              to: { x: x + hexVertices[(i + 1) % 6].x, y: y + hexVertices[(i + 1) % 6].y } 
            }));
            
            return hexEdges.some(edge => 
              (Math.abs(r.position.from.x - edge.from.x) < 10 && 
               Math.abs(r.position.from.y - edge.from.y) < 10 &&
               Math.abs(r.position.to.x - edge.to.x) < 10 && 
               Math.abs(r.position.to.y - edge.to.y) < 10) ||
              (Math.abs(r.position.from.x - edge.to.x) < 10 && 
               Math.abs(r.position.from.y - edge.to.y) < 10 &&
               Math.abs(r.position.to.x - edge.from.x) < 10 && 
               Math.abs(r.position.to.y - edge.from.y) < 10)
            );
          });
          
          return (
            <g key={hex.id} transform={`translate(${x},${y})`}>
              <Hex
                hex={hex}
                size={size}
                buildings={hexBuildings}
                roads={hexRoads}
                playerColors={playerColors}
                robberPosition={robberPosition}
                onVertexClick={onVertexClick ? (vertex) => onVertexClick({ x: x + vertex.x, y: y + vertex.y }) : undefined}
                onEdgeClick={onEdgeClick ? (edge) => onEdgeClick({ 
                  from: { x: x + edge.from.x, y: y + edge.from.y }, 
                  to: { x: x + edge.to.x, y: y + edge.to.y } 
                }) : undefined}
                onHexClick={onHexClick}
                isInteractive={isInteractive}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};