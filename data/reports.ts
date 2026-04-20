import { Hero } from '@/data/heroes';
import { CombatHero } from '@/components/combat-settlement';

export interface BattleReport {
  id: number;
  type: 'PVE' | 'PVP';
  location: string;
  time: string;
  result: {
    isVictory: boolean;
    expGained: number;
    heroUpdates: { heroId: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number }[];
  };
  playerFormationName: string;
  enemyFormationName: string;
  playerHeroes: CombatHero[];
  enemyHeroes: CombatHero[];
  timeRemaining: number;
  
  // For replay
  tileLevel: number;
  troopId: string | null;
}
