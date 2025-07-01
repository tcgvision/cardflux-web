/**
 * TCG Properties Management System
 * Handles validation and management of TCG-specific card properties
 */

export const TCG_PROPERTY_RULES = {
  "One Piece TCG": {
    required: ["character", "cardType", "cost", "power"],
    optional: ["counter", "effect", "artist", "cardText", "flavorText"],
    cardTypes: ["Leader", "Character", "Event", "Stage"],
  },
  "Magic The Gathering": {
    required: ["manaCost", "manaValue", "mtgCardType"],
    optional: ["subtypes", "mtgFlavorText", "artist", "cardText"],
    cardTypes: ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land"],
  },
  "Pokemon TCG": {
    required: ["pokemonType", "hp", "attack1"],
    optional: ["attack2", "weakness", "resistance", "retreatCost", "artist", "cardText"],
    pokemonTypes: ["Fire", "Water", "Grass", "Electric", "Psychic", "Fighting", "Darkness", "Metal", "Fairy", "Colorless"],
  },
} as const;

export type TCGLines = keyof typeof TCG_PROPERTY_RULES;

export function validateTCGProperties(tcgLine: string, attributes: Record<string, unknown>): boolean {
  const rules = TCG_PROPERTY_RULES[tcgLine as TCGLines];
  if (!rules) {
    throw new Error(`Unsupported TCG: ${tcgLine}`);
  }

  const errors: string[] = [];
  
  // Check required fields
  for (const field of rules.required) {
    if (!attributes[field] && attributes[field] !== 0) {
      errors.push(`Field '${field}' is required for ${tcgLine}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  return true;
}

export function getTCGPropertyRules(tcgLine: string) {
  return TCG_PROPERTY_RULES[tcgLine as TCGLines] ?? null;
}

export function getSupportedTCGLines(): TCGLines[] {
  return Object.keys(TCG_PROPERTY_RULES) as TCGLines[];
}

export function isSupportedTCG(tcgLine: string): tcgLine is TCGLines {
  return tcgLine in TCG_PROPERTY_RULES;
}

// Type definitions for TCG-specific attributes
export interface OnePieceAttributes {
  character: string;
  cardType: "Leader" | "Character" | "Event" | "Stage";
  cost: number;
  power: number;
  counter?: number;
  effect?: string;
  artist?: string;
  cardText?: string;
  flavorText?: string;
}

export interface MTGAttributes {
  manaCost: string;
  manaValue: number;
  mtgCardType: "Creature" | "Instant" | "Sorcery" | "Enchantment" | "Artifact" | "Planeswalker" | "Land";
  subtypes?: string[];
  mtgFlavorText?: string;
  artist?: string;
  cardText?: string;
}

export interface PokemonAttributes {
  pokemonType: "Fire" | "Water" | "Grass" | "Electric" | "Psychic" | "Fighting" | "Darkness" | "Metal" | "Fairy" | "Colorless";
  hp: number;
  attack1: string;
  attack2?: string;
  weakness?: string;
  resistance?: string;
  retreatCost?: number;
  artist?: string;
  cardText?: string;
}

export type TCGAttributes = OnePieceAttributes | MTGAttributes | PokemonAttributes;

// Helper function to get the appropriate type for a TCG
export function getTCGAttributeType(tcgLine: string): string {
  switch (tcgLine) {
    case "One Piece TCG":
      return "OnePieceAttributes";
    case "Magic The Gathering":
      return "MTGAttributes";
    case "Pokemon TCG":
      return "PokemonAttributes";
    default:
      return "Record<string, unknown>";
  }
}

// Helper function to get display name for TCG
export function getTCGDisplayName(tcgLine: string): string {
  switch (tcgLine) {
    case "One Piece TCG":
      return "One Piece TCG";
    case "Magic The Gathering":
      return "Magic: The Gathering";
    case "Pokemon TCG":
      return "Pokémon TCG";
    default:
      return tcgLine;
  }
}

// Helper function to get field labels
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    character: "Character",
    cardType: "Card Type",
    cost: "Cost",
    power: "Power",
    counter: "Counter",
    effect: "Effect",
    manaCost: "Mana Cost",
    manaValue: "Mana Value",
    mtgCardType: "Card Type",
    subtypes: "Subtypes",
    mtgFlavorText: "Flavor Text",
    pokemonType: "Pokémon Type",
    hp: "HP",
    attack1: "Attack 1",
    attack2: "Attack 2",
    weakness: "Weakness",
    resistance: "Resistance",
    retreatCost: "Retreat Cost",
    artist: "Artist",
    cardText: "Card Text",
    flavorText: "Flavor Text",
  };
  
  return labels[field] ?? field;
}

// Helper function to get field placeholders
export function getFieldPlaceholder(field: string, tcgLine?: string): string {
  const placeholders: Record<string, Record<string, string>> = {
    "One Piece TCG": {
      character: "Monkey D. Luffy",
      cardType: "Select card type",
      cost: "4",
      power: "5000",
      counter: "1000",
      effect: "When this card attacks...",
    },
    "Magic The Gathering": {
      manaCost: "{2}{U}{U}",
      manaValue: "4",
      mtgCardType: "Select card type",
      subtypes: "Human, Wizard",
      mtgFlavorText: "The flavor text...",
    },
    "Pokemon TCG": {
      pokemonType: "Select Pokémon type",
      hp: "120",
      attack1: "Ember - 30",
      attack2: "Flame Burst - 80",
      weakness: "Water",
      resistance: "Fighting",
      retreatCost: "2",
    },
  };

  if (tcgLine && placeholders[tcgLine]?.[field]) {
    return placeholders[tcgLine][field];
  }

  // Default placeholders
  const defaults: Record<string, string> = {
    artist: "Card artist name",
    cardText: "Card rules text",
    flavorText: "Flavor text",
  };

  return defaults[field] ?? `Enter ${getFieldLabel(field).toLowerCase()}`;
} 