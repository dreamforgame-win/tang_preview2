export const heroExperienceTable: number[] = [
  0,      // Level 1 (starts at 0)
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11
  6600,   // Level 12
  7800,   // Level 13
  9100,   // Level 14
  10500,  // Level 15
  12000,  // Level 16
  13600,  // Level 17
  15300,  // Level 18
  17100,  // Level 19
  19000,  // Level 20
  21000,  // Level 21
  23100,  // Level 22
  25300,  // Level 23
  27600,  // Level 24
  30000,  // Level 25
  32500,  // Level 26
  35100,  // Level 27
  37800,  // Level 28
  40600,  // Level 29
  43500,  // Level 30
  46500,  // Level 31
  49600,  // Level 32
  52800,  // Level 33
  56100,  // Level 34
  59500,  // Level 35
  63000,  // Level 36
  66600,  // Level 37
  70300,  // Level 38
  74100,  // Level 39
  78000,  // Level 40
  82000,  // Level 41
  86100,  // Level 42
  90300,  // Level 43
  94600,  // Level 44
  99000,  // Level 45
  103500, // Level 46
  108100, // Level 47
  112800, // Level 48
  117600, // Level 49
  122500  // Level 50
];

export function getRequiredExpForLevel(level: number): number {
  if (level >= 50) return 0; // Max level
  return heroExperienceTable[level] - heroExperienceTable[level - 1];
}

export interface HeroStats {
  id: number;
  level: number;
  exp: number;
}

export const getHeroStats = (heroId: number): HeroStats => {
  try {
    const savedDataStr = localStorage.getItem('slg_hero_stats');
    if (savedDataStr) {
      const savedData = JSON.parse(savedDataStr);
      if (savedData[heroId]) {
        return savedData[heroId];
      }
    }
  } catch (e) {
    console.error("Failed to load hero stats", e);
  }
  return { id: heroId, level: 1, exp: 0 };
};

export const updateHeroExp = (heroId: number, expGained: number): HeroStats => {
  const stats = getHeroStats(heroId);
  const maxLevel = 50;
  
  if (stats.level >= maxLevel) return stats;
  
  let newExp = stats.exp + expGained;
  let newLevel = stats.level;
  let currentRequired = getRequiredExpForLevel(newLevel);
  
  while (newExp >= currentRequired && newLevel < maxLevel) {
    newExp -= currentRequired;
    newLevel++;
    currentRequired = getRequiredExpForLevel(newLevel);
  }
  
  if (newLevel >= maxLevel) {
    newLevel = maxLevel;
    newExp = 0;
  }
  
  const newStats = { id: heroId, level: newLevel, exp: newExp };
  
  try {
    const savedDataStr = localStorage.getItem('slg_hero_stats');
    const savedData = savedDataStr ? JSON.parse(savedDataStr) : {};
    savedData[heroId] = newStats;
    localStorage.setItem('slg_hero_stats', JSON.stringify(savedData));
  } catch (e) {
    console.error("Failed to save hero stats", e);
  }
  
  return newStats;
};
