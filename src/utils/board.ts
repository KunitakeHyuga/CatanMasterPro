// ボードの初期配置を生成するユーティリティ関数
// ゲームタイプごとのレイアウトや海タイルの位置をまとめて定義している

import { BoardSetup, HexTile, ResourceType } from '../models/types';

/**
 * 指定されたゲームタイプに応じたデフォルトのボード設定を返す
 * TODO: ボードの詳細設定は将来的にデータファイル化する可能性がある
 */
export const generateDefaultBoard = (
  gameType: 'standard' | 'seafarers' | 'cities' | 'traders' | 'america' = 'standard'
): BoardSetup => {
  const hexes: HexTile[] = [];

  let layout: number[];
  let oceanIndices: Set<number>;

  switch (gameType) {
    case 'seafarers':
      layout = [5, 6, 7, 8, 9, 8, 7, 6, 5];
      oceanIndices = new Set([
        0, 1, 2, 3, 4, 5, 11, 12, 18, 19, 26, 27, 34, 35, 41, 42, 43, 44, 45, 46, 47
      ]);
      break;
    case 'cities':
      layout = [4, 5, 6, 7, 6, 5, 4];
      oceanIndices = new Set([
        0, 1, 2, 3, 4, 8, 9, 14, 15, 21, 22, 27, 28, 32, 33, 34, 35, 36
      ]);
      break;
    case 'traders':
      layout = [4, 5, 6, 7, 6, 5, 4];
      oceanIndices = new Set([
        0, 1, 2, 3, 4, 8, 9, 14, 15, 21, 22, 27, 28, 32, 33, 34, 35, 36
      ]);
      break;
    case 'america':
      layout = [3, 4, 5, 6, 5, 4, 3];
      oceanIndices = new Set([0, 1, 2, 3, 7, 8, 12, 13, 18, 19, 23, 24, 25, 26, 27]);
      break;
    default: // standard
      layout = [4, 5, 6, 7, 6, 5, 4];
      oceanIndices = new Set([
        0, 1, 2, 3, 4, 8, 9, 14, 15, 21, 22, 27, 28, 32, 33, 34, 35, 36
      ]);
  }

  const resources: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
  let hexId = 0;

  layout.forEach((rowSize, rowIndex) => {
    const xOffset = (layout.length - rowSize) / 2;
    for (let x = 0; x < rowSize; x++, hexId++) {
      const type: ResourceType = oceanIndices.has(hexId)
        ? 'ocean'
        : hexId === Math.floor(layout.reduce((a, b) => a + b, 0) / 2)
        ? 'desert'
        : resources[hexId % resources.length];

      hexes.push({
        id: `hex-${hexId}`,
        type,
        number: !['ocean', 'desert'].includes(type)
          ? [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12][hexId % 18]
          : undefined,
        position: { x: x + xOffset, y: rowIndex }
      });
    }
  });

  return {
    hexTiles: hexes,
    numberTokens: [],
    harbors: [],
    robberPosition: {
      x: Math.floor(layout[Math.floor(layout.length / 2)] / 2),
      y: Math.floor(layout.length / 2)
    },
    buildings: [],
    roads: []
  };
};
