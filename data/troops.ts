import { TileData } from '@/components/slg-map';

export interface TroopData {
  id: string;
  name: string;
  heroName: string;
  heroAvatar: string;
  level: number;
  hp: number;
  maxHp: number;
  status: '空闲' | '行军' | '战斗';
  type: string;
  combatTag: string;
  targetTile?: TileData;
  startTime?: number;
  endTime?: number;
  route?: {row: number, col: number}[];
}

export const initialTroops: TroopData[] = [];
