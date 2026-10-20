export type GameCategory =
  | 'All'
  | 'Zombies & Survival'
  | 'Shooter & Action'
  | 'Open World & Driving'
  | 'Classic Recompiles'
  | 'Indie & Arcade';

export type GameEngineType =
  | 'zombie_survival'
  | 'gta_drive'
  | 'clustertruck'
  | 'helltaker'
  | 'ultrakill_arena'
  | 'halo_combat'
  | 'skate_park'
  | 'simpsons_hit'
  | 'arcade_runner'
  | 'external_embed';

export interface GameTheme {
  primaryColor: string;
  glowBorderColor: string;
  topHighlightGradient: string;
  backdropGradient: string;
  badgeTextColor: string;
}

export interface ControlBinding {
  key: string;
  action: string;
}

export interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  category: GameCategory;
  tags: string[];
  image: string; // File path or fallback SVG identifier
  theme: GameTheme;
  engine: GameEngineType;
  description: string;
  developer?: string;
  releaseYear: string;
  statusText: string;
  features: string[];
  controls: ControlBinding[];
  embedUrl?: string;
  rating: number;
  playCount: number;
  bannerImage?: string;
  hostDomain?: string;
  shortCategory?: string;
  redirectUrl?: string;
}
