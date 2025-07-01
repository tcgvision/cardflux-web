# CardFlux Product Expansion Strategy

## Current Design: TCG-Focused with Future Flexibility

CardFlux is designed with a **TCG-first approach** that maintains flexibility for future expansion to other product types. This document outlines the current system and how to expand it when needed.

## 🎯 Current Product Model

### Core Fields (All Products)
- `id` - Unique identifier
- `name` - Product name
- `imageUrl` - Product image
- `marketPrice` - Current market price
- `lastPriceUpdate` - Price freshness tracking
- `createdAt` / `updatedAt` - Timestamps

### TCG-Specific Fields
- `setCode` - e.g., "OP06"
- `setName` - e.g., "Awakening of the New Era"
- `tcgLine` - e.g., "One Piece TCG"
- `rarity` - e.g., "Common", "Rare", "Secret Rare"
- `cardNumber` - e.g., "OP06-001"
- `tcgplayerId` - For price sync with TCGPlayer

### Flexible Fields (Future-Ready)
- `productType` - String field for product categorization
- `sku` - Stock Keeping Unit for inventory management
- `barcode` - Universal Product Code for scanning
- `description` - Product description
- `brand` - Brand/manufacturer
- `model` - Model/variant

## 🚀 Current Product Types (TCG-Focused)

### 1. Individual Cards (`productType: "card"`)
- **Use Case**: Individual trading cards
- **Fields Used**: All TCG-specific fields
- **Example**: One Piece TCG OP06-001 Luffy

### 2. Booster Packs (`productType: "booster_pack"`)
- **Use Case**: Individual booster packs
- **Fields Used**: `setCode`, `setName`, `tcgLine`, `brand`
- **Example**: Pokemon TCG Scarlet & Violet 151 Booster Pack

### 3. Booster Boxes (`productType: "booster_box"`)
- **Use Case**: 36-pack booster boxes
- **Fields Used**: `setCode`, `setName`, `tcgLine`, `brand`, `description`
- **Example**: One Piece TCG OP06 Booster Box

### 4. Elite Trainer Boxes (`productType: "etb"`)
- **Use Case**: Pokemon ETBs, special collections
- **Fields Used**: `setCode`, `setName`, `tcgLine`, `brand`, `description`
- **Example**: Pokemon TCG Scarlet & Violet 151 Elite Trainer Box

### 5. Accessories (`productType: "accessory"`)
- **Use Case**: Sleeves, deck boxes, playmats
- **Fields Used**: `brand`, `model`, `description`
- **Example**: Dragon Shield Matte Sleeves

## 🔮 Future Expansion Strategy

### Phase 1: Additional TCG Products
When ready to add more TCG-related products:

```typescript
// New product types to add:
"starter_deck"     // Pre-constructed decks
"structure_deck"   // Yu-Gi-Oh! structure decks
"collector_box"    // Special collector editions
"battle_deck"      // Battle deck products
"promo_card"       // Promotional cards
"sealed_product"   // Any sealed TCG product
```

### Phase 2: Gaming & Collectibles
When expanding beyond TCGs:

```typescript
// Gaming products:
"video_game"       // Console and PC games
"board_game"       // Tabletop games
"card_game"        // Non-TCG card games
"miniature"        // Miniatures and figures

// Collectibles:
"figure"           // Action figures, statues
"comic"            // Comic books
"manga"            // Japanese comics
"poster"           // Posters and prints
"clothing"         // T-shirts, hoodies
"plush"            // Plush toys
"keychain"         // Keychains and small items
```

### Phase 3: General Retail
For full retail expansion:

```typescript
// General retail:
"electronics"      // Electronics and gadgets
"books"            // Books and literature
"snacks"           // Food and beverages
"drinks"           // Beverages
"supplies"         // General supplies
"other"            // Miscellaneous items
```

## 🛠️ Implementation Guidelines

### 1. Product Type Validation
Create a validation system for product types:

```typescript
// In your tRPC router or API
const VALID_PRODUCT_TYPES = {
  // TCG Products
  card: ['setCode', 'setName', 'tcgLine', 'rarity', 'cardNumber'],
  booster_pack: ['setCode', 'setName', 'tcgLine'],
  booster_box: ['setCode', 'setName', 'tcgLine'],
  etb: ['setCode', 'setName', 'tcgLine'],
  accessory: ['brand', 'model'],
  
  // Future types (commented until needed)
  // video_game: ['brand', 'model', 'platform'],
  // figure: ['brand', 'model', 'series'],
} as const;
```

### 2. Conditional Field Requirements
Implement conditional validation based on product type:

```typescript
// Example validation logic
function validateProductFields(productType: string, fields: any) {
  const requiredFields = VALID_PRODUCT_TYPES[productType] || [];
  
  for (const field of requiredFields) {
    if (!fields[field]) {
      throw new Error(`Field ${field} is required for product type ${productType}`);
    }
  }
}
```

### 3. UI Components
Create flexible UI components that adapt to product type:

```typescript
// Product form component
function ProductForm({ productType }: { productType: string }) {
  const fields = VALID_PRODUCT_TYPES[productType] || [];
  
  return (
    <form>
      {/* Common fields */}
      <input name="name" placeholder="Product Name" />
      <input name="imageUrl" placeholder="Image URL" />
      
      {/* Conditional fields based on product type */}
      {fields.includes('setCode') && (
        <input name="setCode" placeholder="Set Code" />
      )}
      {fields.includes('brand') && (
        <input name="brand" placeholder="Brand" />
      )}
      {/* ... more conditional fields */}
    </form>
  );
}
```

## 📊 Database Migration Strategy

### When Adding New Product Types
1. **No Schema Changes Required**: The current flexible fields handle most cases
2. **Add Validation Rules**: Update your validation logic
3. **Update UI Components**: Modify forms and displays
4. **Add Product Type Constants**: Update your TypeScript types

### When Adding New Fields (If Needed)
If you need completely new fields for specific product types:

```sql
-- Example: Adding platform field for video games
ALTER TABLE "Product" ADD COLUMN "platform" TEXT;
-- Add index if needed
CREATE INDEX "Product_platform_idx" ON "Product"("platform");
```

## 🎨 User Experience Considerations

### 1. Product Type Selection
- Clear dropdown or radio buttons for product type
- Show/hide relevant fields based on selection
- Provide examples for each product type

### 2. Search and Filtering
- Filter by product type
- Search across all product types
- Category-based browsing

### 3. Inventory Management
- Different inventory tracking for different product types
- Condition tracking (relevant for cards, less for sealed products)
- Bulk operations by product type

## 🔧 Technical Implementation

### 1. TypeScript Types
```typescript
type ProductType = 
  | 'card' 
  | 'booster_pack' 
  | 'booster_box' 
  | 'etb' 
  | 'accessory'
  // Add more as needed

interface Product {
  id: string;
  name: string;
  productType: ProductType;
  // ... other fields
}
```

### 2. API Endpoints
```typescript
// Get products by type
GET /api/products?type=card
GET /api/products?type=booster_box

// Get all product types
GET /api/product-types

// Create product with validation
POST /api/products
```

### 3. Database Queries
```typescript
// Get products by type
const cards = await prisma.product.findMany({
  where: { productType: 'card' }
});

// Get product types with counts
const productTypes = await prisma.product.groupBy({
  by: ['productType'],
  _count: { productType: true }
});
```

## 📈 Benefits of This Approach

### 1. **Immediate Value**
- Focus on TCG products that shops need most
- Simple, intuitive interface for card shops
- Fast development and deployment

### 2. **Future-Proof**
- Easy to add new product types without schema changes
- Flexible fields accommodate most product types
- Gradual expansion without breaking existing functionality

### 3. **Maintainable**
- Single product table for all types
- Consistent API and database structure
- Easy to add validation and business logic

### 4. **Scalable**
- Can handle thousands of different product types
- Efficient indexing and querying
- Supports complex inventory management

## 🎯 Next Steps

1. **Implement Current TCG Types**: Focus on cards, booster packs, boxes, and ETBs
2. **Add Product Type Validation**: Ensure data integrity
3. **Create Flexible UI**: Build forms that adapt to product type
4. **Test with Real Data**: Validate with actual shop inventory
5. **Plan Expansion**: Document requirements for new product types

This design gives you a solid TCG foundation while keeping the door open for future growth into other collectibles and retail products. 