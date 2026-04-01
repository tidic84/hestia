import type { ChallengeDef } from '../types';

export const CHALLENGE_POOL: ChallengeDef[] = [
  // Couleurs
  { id: 'color_blue', prompt: 'Photographie quelque chose de bleu', category: 'color' },
  { id: 'color_red', prompt: 'Photographie quelque chose de rouge', category: 'color' },
  { id: 'color_green', prompt: 'Photographie quelque chose de vert', category: 'color' },
  { id: 'color_yellow', prompt: 'Photographie quelque chose de jaune', category: 'color' },
  { id: 'color_pink', prompt: 'Photographie quelque chose de rose', category: 'color' },
  { id: 'color_orange', prompt: 'Photographie quelque chose d\'orange', category: 'color' },

  // Nature
  { id: 'nature_sky', prompt: 'Photographie le ciel', category: 'nature' },
  { id: 'nature_tree', prompt: 'Photographie un arbre', category: 'nature' },
  { id: 'nature_flower', prompt: 'Photographie une fleur', category: 'nature' },
  { id: 'nature_water', prompt: 'Photographie de l\'eau', category: 'nature' },
  { id: 'nature_animal', prompt: 'Photographie un animal', category: 'nature' },
  { id: 'nature_sunset', prompt: 'Photographie un coucher de soleil', category: 'nature' },

  // Nourriture
  { id: 'food_meal', prompt: 'Photographie ton repas', category: 'food' },
  { id: 'food_drink', prompt: 'Photographie ta boisson', category: 'food' },
  { id: 'food_dessert', prompt: 'Photographie un dessert', category: 'food' },
  { id: 'food_fruit', prompt: 'Photographie un fruit', category: 'food' },
  { id: 'food_coffee', prompt: 'Photographie ton cafe', category: 'food' },

  // Perspective
  { id: 'angle_low', prompt: 'Photo en contre-plongee', category: 'perspective' },
  { id: 'angle_high', prompt: 'Photo en plongee', category: 'perspective' },
  { id: 'angle_close', prompt: 'Photo en gros plan', category: 'perspective' },
  { id: 'angle_far', prompt: 'Photo de loin', category: 'perspective' },
  { id: 'angle_reflection', prompt: 'Photographie un reflet', category: 'perspective' },
  { id: 'angle_shadow', prompt: 'Photographie une ombre', category: 'perspective' },
  { id: 'angle_symmetry', prompt: 'Photographie quelque chose de symetrique', category: 'perspective' },

  // Personnes
  { id: 'people_selfie', prompt: 'Prends un selfie', category: 'people' },
  { id: 'people_hands', prompt: 'Photographie des mains', category: 'people' },
  { id: 'people_smile', prompt: 'Capture un sourire', category: 'people' },
  { id: 'people_duo', prompt: 'Photo a deux', category: 'people' },

  // Lieux
  { id: 'place_window', prompt: 'Photo depuis une fenetre', category: 'place' },
  { id: 'place_street', prompt: 'Photographie une rue', category: 'place' },
  { id: 'place_door', prompt: 'Photographie une porte', category: 'place' },
  { id: 'place_stairs', prompt: 'Photographie un escalier', category: 'place' },
  { id: 'place_favorite', prompt: 'Photographie ton endroit prefere', category: 'place' },

  // Objets
  { id: 'object_book', prompt: 'Photographie un livre', category: 'object' },
  { id: 'object_shoes', prompt: 'Photographie tes chaussures', category: 'object' },
  { id: 'object_clock', prompt: 'Photographie une horloge', category: 'object' },
  { id: 'object_old', prompt: 'Photographie quelque chose de vieux', category: 'object' },
  { id: 'object_new', prompt: 'Photographie quelque chose de neuf', category: 'object' },
  { id: 'object_round', prompt: 'Photographie quelque chose de rond', category: 'object' },

  // Ambiance
  { id: 'mood_peaceful', prompt: 'Photographie quelque chose de paisible', category: 'mood' },
  { id: 'mood_colorful', prompt: 'Photo la plus coloree possible', category: 'mood' },
  { id: 'mood_minimal', prompt: 'Photo minimaliste', category: 'mood' },
  { id: 'mood_cozy', prompt: 'Photographie un endroit cosy', category: 'mood' },
  { id: 'mood_movement', prompt: 'Capture du mouvement', category: 'mood' },

  // Creativite
  { id: 'creative_pattern', prompt: 'Photographie un motif repetitif', category: 'creative' },
  { id: 'creative_texture', prompt: 'Photographie une texture', category: 'creative' },
  { id: 'creative_frame', prompt: 'Utilise un cadre naturel dans ta photo', category: 'creative' },
  { id: 'creative_light', prompt: 'Joue avec la lumiere', category: 'creative' },
  { id: 'creative_contrast', prompt: 'Photographie un contraste', category: 'creative' },
];
