# TCG Properties Management System

## Overview

CardFlux uses a flexible system to handle the different properties and attributes that vary between TCG franchises. This document outlines how to manage and extend the system for different card games.

## 🎯 Current TCG Support

### Supported Franchises
- **One Piece TCG** - Character-based card game with power/cost mechanics
- **Magic: The Gathering** - Complex spell system with mana costs and types
- **Pokémon TCG** - Pokémon with HP, attacks, and type-based mechanics

## 🏗️ Database Architecture

### Core Product Model
The main `Product` model contains universal fields:
```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  setCode       String?   // e.g., "OP06", "SV151"
  setName       String?   // e.g., "Awakening of the New Era"
  tcgLine       String    // e.g., "One Piece TCG", "Pokemon TCG"
  rarity        String?   // e.g., "Common", "Rare", "Secret Rare"
  cardNumber    String?   // e.g., "OP06-001", "151/165"
  // ... other universal fields
}
```

### Franchise-Specific Attributes
The `ProductFranchiseAttributes` model handles TCG-specific properties:
```prisma
model ProductFranchiseAttributes {
  id          String   @id @default(cuid())
  productId   String   @unique
  
  // One Piece TCG specific
  character   String?  // Character name
  cardType    String?  // Leader, Character, Event, Stage
  cost        Int?     // Card cost
  power       Int?     // Card power
  counter     Int?     // Counter power
  effect      String?  // Card effect text
  
  // Magic The Gathering specific
  manaCost    String?  // Mana cost
  manaValue   Int?     // Converted mana cost
  mtgCardType String?  // Creature, Instant, Sorcery, etc.
  subtypes    String[] // Card subtypes
  mtgFlavorText String?  // Flavor text
  
  // Pokemon TCG specific
  pokemonType String?  // Fire, Water, etc.
  hp          Int?     // Hit points
  attack1     String?  // First attack
  attack2     String?  // Second attack
  weakness    String?  // Weakness type
  resistance  String?  // Resistance type
  retreatCost Int?     // Retreat cost
  
  // Common attributes
  artist      String?  // Card artist
  cardText    String?  // Card rules text
  flavorText  String?  // Flavor text
}
```

## 🎮 TCG-Specific Property Definitions

### One Piece TCG Properties
```typescript
interface OnePieceAttributes {
  character: string;     // "Monkey D. Luffy"
  cardType: "Leader" | "Character" | "Event" | "Stage";
  cost: number;          // 4
  power: number;         // 5000
  counter: number;       // 1000
  effect: string;        // "When this card attacks..."
}
```

### Magic: The Gathering Properties
```typescript
interface MTGAttributes {
  manaCost: string;      // "{2}{U}{U}"
  manaValue: number;     // 4
  mtgCardType: "Creature" | "Instant" | "Sorcery" | "Enchantment" | "Artifact" | "Planeswalker" | "Land";
  subtypes: string[];    // ["Human", "Wizard"]
  mtgFlavorText: string; // "The flavor text..."
}
```

### Pokémon TCG Properties
```typescript
interface PokemonAttributes {
  pokemonType: "Fire" | "Water" | "Grass" | "Electric" | "Psychic" | "Fighting" | "Darkness" | "Metal" | "Fairy" | "Colorless";
  hp: number;            // 120
  attack1: string;       // "Ember - 30"
  attack2?: string;      // "Flame Burst - 80"
  weakness: string;      // "Water"
  resistance?: string;   // "Fighting"
  retreatCost: number;   // 2
}
```

## 🛠️ Implementation Strategy

### 1. TCG Property Validation System

Create a validation system that ensures the right properties are filled for each TCG:

```typescript
// src/lib/tcg-properties.ts
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

export function validateTCGProperties(tcgLine: string, attributes: any) {
  const rules = TCG_PROPERTY_RULES[tcgLine as keyof typeof TCG_PROPERTY_RULES];
  if (!rules) {
    throw new Error(`Unsupported TCG: ${tcgLine}`);
  }

  const errors: string[] = [];
  
  // Check required fields
  for (const field of rules.required) {
    if (!attributes[field]) {
      errors.push(`Field '${field}' is required for ${tcgLine}`);
    }
  }

  // Validate card types
  if (attributes.cardType && rules.cardTypes && !rules.cardTypes.includes(attributes.cardType)) {
    errors.push(`Invalid card type '${attributes.cardType}' for ${tcgLine}`);
  }

  if (attributes.pokemonType && rules.pokemonTypes && !rules.pokemonTypes.includes(attributes.pokemonType)) {
    errors.push(`Invalid Pokemon type '${attributes.pokemonType}' for ${tcgLine}`);
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  return true;
}
```

### 2. Dynamic Form Components

Create UI components that adapt based on the selected TCG:

```typescript
// src/components/tcg-property-form.tsx
import { TCG_PROPERTY_RULES } from '~/lib/tcg-properties';

interface TCGPropertyFormProps {
  tcgLine: string;
  attributes: any;
  onChange: (attributes: any) => void;
}

export function TCGPropertyForm({ tcgLine, attributes, onChange }: TCGPropertyFormProps) {
  const rules = TCG_PROPERTY_RULES[tcgLine as keyof typeof TCG_PROPERTY_RULES];
  
  if (!rules) {
    return <div>Unsupported TCG: {tcgLine}</div>;
  }

  const updateAttribute = (field: string, value: any) => {
    onChange({ ...attributes, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* One Piece TCG Fields */}
      {tcgLine === "One Piece TCG" && (
        <>
          <div>
            <label>Character</label>
            <input
              value={attributes.character || ''}
              onChange={(e) => updateAttribute('character', e.target.value)}
              placeholder="Monkey D. Luffy"
            />
          </div>
          <div>
            <label>Card Type</label>
            <select
              value={attributes.cardType || ''}
              onChange={(e) => updateAttribute('cardType', e.target.value)}
            >
              <option value="">Select type</option>
              {rules.cardTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Cost</label>
            <input
              type="number"
              value={attributes.cost || ''}
              onChange={(e) => updateAttribute('cost', parseInt(e.target.value))}
              placeholder="4"
            />
          </div>
          <div>
            <label>Power</label>
            <input
              type="number"
              value={attributes.power || ''}
              onChange={(e) => updateAttribute('power', parseInt(e.target.value))}
              placeholder="5000"
            />
          </div>
        </>
      )}

      {/* Magic: The Gathering Fields */}
      {tcgLine === "Magic The Gathering" && (
        <>
          <div>
            <label>Mana Cost</label>
            <input
              value={attributes.manaCost || ''}
              onChange={(e) => updateAttribute('manaCost', e.target.value)}
              placeholder="{2}{U}{U}"
            />
          </div>
          <div>
            <label>Card Type</label>
            <select
              value={attributes.mtgCardType || ''}
              onChange={(e) => updateAttribute('mtgCardType', e.target.value)}
            >
              <option value="">Select type</option>
              {rules.cardTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Pokemon TCG Fields */}
      {tcgLine === "Pokemon TCG" && (
        <>
          <div>
            <label>Pokemon Type</label>
            <select
              value={attributes.pokemonType || ''}
              onChange={(e) => updateAttribute('pokemonType', e.target.value)}
            >
              <option value="">Select type</option>
              {rules.pokemonTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label>HP</label>
            <input
              type="number"
              value={attributes.hp || ''}
              onChange={(e) => updateAttribute('hp', parseInt(e.target.value))}
              placeholder="120"
            />
          </div>
          <div>
            <label>Attack 1</label>
            <input
              value={attributes.attack1 || ''}
              onChange={(e) => updateAttribute('attack1', e.target.value)}
              placeholder="Ember - 30"
            />
          </div>
        </>
      )}

      {/* Common Fields */}
      <div>
        <label>Artist</label>
        <input
          value={attributes.artist || ''}
          onChange={(e) => updateAttribute('artist', e.target.value)}
          placeholder="Card artist name"
        />
      </div>
      <div>
        <label>Card Text</label>
        <textarea
          value={attributes.cardText || ''}
          onChange={(e) => updateAttribute('cardText', e.target.value)}
          placeholder="Card rules text"
        />
      </div>
    </div>
  );
}
```

### 3. tRPC Router Integration

Update your product router to handle TCG-specific validation:

```typescript
// src/server/api/routers/shop.ts
import { validateTCGProperties } from '~/lib/tcg-properties';

export const shopRouter = createTRPCRouter({
  createProduct: protectedProcedure
    .input(z.object({
      name: z.string(),
      tcgLine: z.string(),
      setCode: z.string().optional(),
      setName: z.string().optional(),
      rarity: z.string().optional(),
      cardNumber: z.string().optional(),
      // ... other product fields
      franchiseAttributes: z.object({
        // One Piece
        character: z.string().optional(),
        cardType: z.string().optional(),
        cost: z.number().optional(),
        power: z.number().optional(),
        counter: z.number().optional(),
        effect: z.string().optional(),
        // MTG
        manaCost: z.string().optional(),
        manaValue: z.number().optional(),
        mtgCardType: z.string().optional(),
        subtypes: z.array(z.string()).optional(),
        mtgFlavorText: z.string().optional(),
        // Pokemon
        pokemonType: z.string().optional(),
        hp: z.number().optional(),
        attack1: z.string().optional(),
        attack2: z.string().optional(),
        weakness: z.string().optional(),
        resistance: z.string().optional(),
        retreatCost: z.number().optional(),
        // Common
        artist: z.string().optional(),
        cardText: z.string().optional(),
        flavorText: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate TCG properties
      if (input.franchiseAttributes) {
        validateTCGProperties(input.tcgLine, input.franchiseAttributes);
      }

      // Create product with franchise attributes
      const product = await ctx.db.product.create({
        data: {
          name: input.name,
          tcgLine: input.tcgLine,
          setCode: input.setCode,
          setName: input.setName,
          rarity: input.rarity,
          cardNumber: input.cardNumber,
          shopId: ctx.shopId,
          franchiseAttributes: input.franchiseAttributes ? {
            create: input.franchiseAttributes
          } : undefined,
        },
        include: {
          franchiseAttributes: true,
        },
      });

      return product;
    }),
});
```

## 🔮 Adding New TCGs

### Step 1: Define Properties
Add the new TCG to the property rules:

```typescript
// Add to TCG_PROPERTY_RULES
"Yu-Gi-Oh! TCG": {
  required: ["attribute", "level", "atk", "def"],
  optional: ["cardType", "effect", "artist", "cardText"],
  attributes: ["DARK", "LIGHT", "EARTH", "WATER", "FIRE", "WIND"],
  cardTypes: ["Monster", "Spell", "Trap"],
},
```

### Step 2: Add Database Fields
Add new fields to the `ProductFranchiseAttributes` model:

```prisma
// Add to ProductFranchiseAttributes
// Yu-Gi-Oh! TCG specific
attribute   String?  // DARK, LIGHT, EARTH, etc.
level       Int?     // Monster level
atk         Int?     // Attack points
def         Int?     // Defense points
ygoCardType String?  // Monster, Spell, Trap
```

### Step 3: Update UI Components
Add the new TCG to the form component and validation logic.

## 📊 Benefits of This System

### 1. **Flexible & Extensible**
- Easy to add new TCGs without breaking existing functionality
- Each TCG can have its own unique properties
- Common properties are shared across all TCGs

### 2. **Type Safe**
- TypeScript validation ensures data integrity
- Compile-time checking for property names
- Runtime validation for required fields

### 3. **User Friendly**
- Dynamic forms that adapt to the selected TCG
- Clear validation messages
- Intuitive field organization

### 4. **Performance Optimized**
- Efficient database queries
- Proper indexing on TCG-specific fields
- Minimal data duplication

## 🎯 Next Steps

1. **Implement the validation system** for existing TCGs
2. **Create the dynamic form components** for product creation
3. **Update your tRPC routers** to handle TCG-specific validation
4. **Add support for new TCGs** as needed
5. **Create admin tools** for managing TCG property rules

This system gives you a solid foundation for managing diverse TCG properties while maintaining flexibility for future expansion. 