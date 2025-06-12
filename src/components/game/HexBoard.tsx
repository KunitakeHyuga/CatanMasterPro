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
  wood: '#10b981', // emerald-500 - 森林
  brick: '#dc2626', // red-600 - 丘陵
  sheep: '#22c55e', // green-500 - 牧草地
  wheat: '#eab308', // yellow-500 - 農地
  ore: '#6b7280', // gray-500 - 山地
  desert: '#fbbf24', // amber-400 - 砂漠
};

const resourceNames: Record<ResourceType, string> = {
  wood: '森林',
  brick: '丘陵',
  sheep: '牧草地',
  wheat: '農地',
  ore: '山地',
  desert: '砂漠',
};

const Hex: React.FC<HexProps> = ({ 
  hex, 
  size = 50,
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
  // 六角形の頂点を計算（フラットトップ）
  const vertices: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度回転でフラットトップに
    vertices.push({
      x: size * Math.cos(angle),
      y: size * Math.sin(angle)
    });
  }

  // エッジを作成
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
      {/* 六角形の基本形状 */}
      <polygon 
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
        fill={resourceColors[hex.type]}
        stroke="#374151" 
        strokeWidth="2"
        className={isInteractive ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onHexClick?.(hex)}
      />
      
      {/* リソース名 */}
      <text
        x={0}
        y={-8}
        textAnchor="middle"
        fill={textColor}
        className="text-xs font-medium pointer-events-none"
      >
        {resourceNames[hex.type]}
      </text>
      
      {/* 数字トークン */}
      {hex.number && (
        <>
          <circle
            cx={0}
            cy={8}
            r="12"
            fill="#f3f4f6"
            stroke="#374151"
            strokeWidth="1"
            className="pointer-events-none"
          />
          <text
            x={0}
            y={12}
            textAnchor="middle"
            fill={hex.number === 6 || hex.number === 8 ? '#dc2626' : '#374151'}
            className="text-sm font-bold pointer-events-none"
          >
            {hex.number}
          </text>
        </>
      )}
      
      {/* 盗賊 */}
      {isRobber && (
        <circle
          cx={0}
          cy={0}
          r="8"
          fill="#1f2937"
          className="pointer-events-none"
        />
      )}
      
      {/* 道路 */}
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
      
      {/* 建物 */}
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
      
      {/* インタラクティブな頂点 */}
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
      
      {/* インタラクティブなエッジ */}
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

// 海タイル（港）コンポーネント
interface OceanTileProps {
  position: { x: number; y: number };
  harbor?: Harbor;
  size?: number;
}

const OceanTile: React.FC<OceanTileProps> = ({ position, harbor, size = 50 }) => {
  // 六角形の頂点を計算
  const vertices: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    vertices.push({
      x: size * Math.cos(angle),
      y: size * Math.sin(angle)
    });
  }

  return (
    <g>
      {/* 海の六角形 */}
      <polygon 
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
        fill="#3b82f6"
        stroke="#1e40af" 
        strokeWidth="2"
        opacity="0.7"
      />
      
      {/* 港の表示 */}
      {harbor && (
        <>
          <rect
            x={-20}
            y={-8}
            width="40"
            height="16"
            fill="#1e40af"
            stroke="#1e3a8a"
            strokeWidth="1"
            rx="3"
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#ffffff"
            className="text-xs font-bold pointer-events-none"
          >
            {harbor.type === 'any' ? '3:1' : `2:1 ${harbor.type}`}
          </text>
        </>
      )}
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
  size = 50,
  onVertexClick,
  onEdgeClick,
  onHexClick,
  isInteractive = false
}) => {
  // カタンボードの正しい配置を計算
  const getHexPosition = (col: number, row: number) => {
    const x = col * (size * Math.sqrt(3));
    const y = row * (size * 1.5); // 奇数列をずらす必要はない
    return { x, y };
  };

  // 海タイルの位置を定義（カタンボードの周囲）
  const oceanPositions = [
    // 上の行
    { col: -1, row: -1 }, { col: 0, row: -2 }, { col: 1, row: -2 }, { col: 2, row: -2 }, { col: 3, row: -1 },
    // 右側
    { col: 4, row: 0 }, { col: 4, row: 1 }, { col: 4, row: 2 },
    // 下の行
    { col: 3, row: 3 }, { col: 2, row: 4 }, { col: 1, row: 4 }, { col: 0, row: 4 }, { col: -1, row: 3 },
    // 左側
    { col: -2, row: 2 }, { col: -2, row: 1 }, { col: -2, row: 0 }
  ];

  // ボードの境界を計算
  const allPositions = [
    ...hexes.map(hex => ({ col: hex.position.x, row: hex.position.y })),
    ...oceanPositions
  ];
  
  const minX = Math.min(...allPositions.map(pos => getHexPosition(pos.col, pos.row).x)) - size;
  const maxX = Math.max(...allPositions.map(pos => getHexPosition(pos.col, pos.row).x)) + size;
  const minY = Math.min(...allPositions.map(pos => getHexPosition(pos.col, pos.row).y)) - size;
  const maxY = Math.max(...allPositions.map(pos => getHexPosition(pos.col, pos.row).y)) + size;
  
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
        {/* 海タイルを描画 */}
        {oceanPositions.map((oceanPos, index) => {
          const pos = getHexPosition(oceanPos.col, oceanPos.row);
          const harbor = harbors.find(h => 
            Math.abs(h.position.x - oceanPos.col) < 0.5 && 
            Math.abs(h.position.y - oceanPos.row) < 0.5
          );
          
          return (
            <g key={`ocean-${index}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <OceanTile 
                position={oceanPos}
                harbor={harbor}
                size={size}
              />
            </g>
          );
        })}
        
        {/* 陸地タイルを描画 */}
        {hexes.map(hex => {
          const pos = getHexPosition(hex.position.x, hex.position.y);
          
          return (
            <g key={hex.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <Hex 
                hex={hex} 
                size={size}
                buildings={buildings.filter(b => 
                  Math.abs(b.position.x - pos.x) < size &&
                  Math.abs(b.position.y - pos.y) < size
                )}
                roads={roads.filter(r => 
                  Math.abs(r.position.from.x - pos.x) < size &&
                  Math.abs(r.position.from.y - pos.y) < size
                )}
                harbors={harbors}
                playerColors={playerColors}
                robberPosition={robberPosition}
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