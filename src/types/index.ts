export interface Photo {
  id: string;
  date: string; // YYYY-MM-DD
  file_path: string; // relative to documentDirectory
  width: number;
  height: number;
  latitude: number | null;
  longitude: number | null;
  challenge_id: string | null;
  created_at: string; // ISO 8601
}

export interface Badge {
  id: string;
  unlocked_at: string; // ISO 8601
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (ctx: GamificationContext) => boolean;
}

export interface GamificationContext {
  currentStreak: number;
  longestStreak: number;
  totalPhotos: number;
  photoHour: number | null;
  challengesCompleted: number;
  weekendPhotos: number;
  geolocatedPhotos: number;
  uniqueLocations: number;
}

export interface Challenge {
  id: string;
  date: string; // YYYY-MM-DD
  prompt: string;
  category: string;
  completed: number; // 0 or 1
}

export interface ChallengeDef {
  id: string;
  prompt: string;
  category: string;
}

export interface AppState {
  key: string;
  value: string;
}
