import React from 'react';
import { HexTile, ResourceType, Building, Road, PlayerColor, Vertex, Edge } from '../../models/types';

interface HexProps {
  hex: HexTile;
  size?: number;
  buildings: Building[];
  roads: Road[];
  playerColors: Record<string, PlayerColor>;
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
  ocean: '#3b82f6',
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
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false,
}) => {
  const vertices = computeVertices(size);
  const edges: Edge[] = vertices.map((v, i) => ({ from: v, to: vertices[(i + 1) % 6] }));

  const isOcean = hex.type === 'ocean';
  const fill = resourceColors[hex.type];
  const textColor = '#ffffff';

  return (
    <g onClick={() => isOcean ? undefined : onHexClick?.(hex)} className={isOcean ? undefined : (isInteractive ? 'cursor-pointer hover:opacity-80' : '')}>
      <polygon
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
        fill={fill}
        stroke="#374151"
        strokeWidth={2}
      />
      {/* リソース名（海タイルは「海」と表示） */}
      <text x={0} y={-8} textAnchor="middle" fill={textColor} className="text-xs font-medium pointer-events-none">
        {resourceNames[hex.type]}
      </text>
      {/* 数字トークン・道路・建物は陸タイルのみ */}
      {!isOcean && (
        <>
          {hex.number && (
            <>
              <circle cx={0} cy={8} r={12} fill="#f3f4f6" stroke="#374151" strokeWidth={1} className="pointer-events-none" />
              <text x={0} y={12} textAnchor="middle" fill={hex.number === 6 || hex.number === 8 ? '#dc2626' : '#374151'} className="text-sm font-bold pointer-events-none">
                {hex.number}
              </text>
            </>
          )}
          {roads.map((road, i) => (
            <line key={i} x1={road.position.from.x} y1={road.position.from.y} x2={road.position.to.x} y2={road.position.to.y} stroke={playerColors[road.playerId] || '#000'} strokeWidth={4} />
          ))}
          {buildings.map((b, i) => {
            const col = playerColors[b.playerId] || '#000';
            return b.type === 'settlement' ? (
              <circle key={i} cx={b.position.x} cy={b.position.y} r={6} fill={col} stroke="#fff" strokeWidth={2} />
            ) : (
              <rect key={i} x={b.position.x - 8} y={b.position.y - 8} width={16} height={16} fill={col} stroke="#fff" strokeWidth={2} />
            );
          })}
          {isInteractive && vertices.map((v, i) => (
            <circle key={i} cx={v.x} cy={v.y} r={8} fill="transparent" className="hover:fill-gray-200 opacity-0 hover:opacity-50 cursor-pointer" onClick={() => onVertexClick?.(v)} />
          ))}
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
                onClick={() => onEdgeClick?.(e)}
              />
            );
          })}
        </>
      )}
    </g>
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
  onHexClick?: (hex: HexTile) => void;
  isInteractive?: boolean;
}

export const HexBoard: React.FC<HexBoardProps> = ({
  hexes,
  buildings = [],
  roads = [],
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
          return (
            <g key={hex.id} transform={`translate(${x},${y})`}>
              <Hex
                hex={hex}
                size={size}
                buildings={buildings.filter(b => Math.abs(b.position.x - x) < size && Math.abs(b.position.y - y) < size)}
                roads={roads.filter(r => Math.abs(r.position.from.x - x) < size)}
                playerColors={playerColors}
                onVertexClick={onVertexClick}
                onEdgeClick={onEdgeClick}
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
