import React from 'react';
import { Player, GameSession } from '../../models/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PlayerStatsProps {
  player: Player;
  games: GameSession[];
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player, games }) => {
  // Filter games where this player participated
  const playerGames = games.filter(game => 
    game.players.some(p => p.playerId === player.id)
  );
  
  if (playerGames.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No games recorded for this player yet.</p>
      </div>
    );
  }
  
  // Sort games by date
  const sortedGames = [...playerGames].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get player performance in each game
  const playerPerformance = sortedGames.map(game => {
    const playerInGame = game.players.find(p => p.playerId === player.id);
    return {
      date: game.date,
      score: playerInGame?.score || 0,
      rank: playerInGame?.rank || 0,
      won: game.winner === player.id
    };
  });
  
  // Prepare data for score trend chart
  const scoreTrendData = {
    labels: playerPerformance.map(game => game.date),
    datasets: [
      {
        label: 'Score',
        data: playerPerformance.map(game => game.score),
        borderColor: 'rgb(52, 211, 153)',
        backgroundColor: 'rgba(52, 211, 153, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Prepare data for rank distribution chart
  const rankCounts = [0, 0, 0, 0, 0, 0]; // For ranks 1-6
  playerPerformance.forEach(game => {
    if (game.rank > 0 && game.rank <= 6) {
      rankCounts[game.rank - 1]++;
    }
  });
  
  const rankDistributionData = {
    labels: ['1st', '2nd', '3rd', '4th', '5th', '6th'],
    datasets: [
      {
        label: 'Times Achieved',
        data: rankCounts,
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // Gold
          'rgba(156, 163, 175, 0.8)', // Silver
          'rgba(180, 83, 9, 0.8)', // Bronze
          'rgba(55, 65, 81, 0.8)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };
  
  // Calculate win rate
  const winCount = playerPerformance.filter(game => game.won).length;
  const winRate = (winCount / playerPerformance.length) * 100;
  
  // Calculate average score
  const totalScore = playerPerformance.reduce((sum, game) => sum + game.score, 0);
  const avgScore = totalScore / playerPerformance.length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-500">Games Played</h3>
              <p className="text-3xl font-bold mt-2">{playerGames.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-500">Win Rate</h3>
              <p className="text-3xl font-bold mt-2">{winRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-500">Avg. Score</h3>
              <p className="text-3xl font-bold mt-2">{avgScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={scoreTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rank Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={rankDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};