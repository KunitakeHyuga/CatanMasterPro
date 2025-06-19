import React, { useState } from 'react';
import { Player } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, X } from 'lucide-react';

interface PlayerSelectorProps {
  onSelect: (player: Player) => void;
  selectedIds: string[];
  onClose: () => void;
}

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({ onSelect, selectedIds, onClose }) => {
  const { players } = useGameStore();
  const [search, setSearch] = useState('');

  // 検索対象から既に選択済みのプレイヤーを除外
  const availablePlayers = players.filter(p => !selectedIds.includes(p.id));

  // 推奨プレイヤーはゲーム参加回数が多い順に取得
  const recommendedPlayers = [...availablePlayers]
    .sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed)
    .slice(0, 5);

  const filteredPlayers = search
    ? availablePlayers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : recommendedPlayers;

  return (
    <Card className="absolute z-20 mt-2 w-72">
      <CardHeader className="flex items-center justify-between py-2 px-3">
        <CardTitle className="text-sm">Select Player</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} icon={<X size={16} />} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="max-h-48 overflow-y-auto divide-y divide-gray-200">
          {filteredPlayers.map(player => (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                onSelect(player);
                onClose();
              }}
              className="w-full flex items-center p-2 text-left hover:bg-gray-50"
            >
              <div
                className="h-4 w-4 rounded-full mr-2"
                style={{ backgroundColor: player.color }}
              />
              <span className="flex-1 text-sm">{player.name}</span>
              <span className="text-xs text-gray-500">{player.stats.gamesPlayed} games</span>
            </button>
          ))}
          {filteredPlayers.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No players found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
