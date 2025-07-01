# Skeleton Loading System

This directory contains skeleton loading components for all dashboard pages in the CardFlux application.

## Overview

The skeleton loading system provides a better user experience by showing placeholder content while data is loading, instead of generic loading spinners.

## Components

### Individual Skeleton Components

Each skeleton component is designed to match the layout of its corresponding page:

- `DashboardSkeleton` - Dashboard overview page
- `ScannerSkeleton` - Card scanner interface
- `InventorySkeleton` - Inventory management page
- `CustomersSkeleton` - Customer management page
- `TransactionsSkeleton` - Transaction history page
- `BuylistsSkeleton` - Buylist management page
- `AnalyticsSkeleton` - Analytics and reporting page
- `TeamSkeleton` - Team management page
- `SettingsSkeleton` - Settings page
- `ReportsSkeleton` - Reports page
- `StoreCreditSkeleton` - Store credit management page

### Wrapper Components

- `SkeletonWrapper` - Automatically shows the appropriate skeleton based on the current route
- `DashboardLayoutWrapper` - Simple wrapper for dashboard pages

## Usage

### For Individual Pages

```tsx
import { DashboardLayoutWrapper } from "~/components/dashboard-layout-wrapper";

export default function MyPage() {
  return (
    <DashboardLayoutWrapper>
      {/* Your page content */}
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Page content here */}
      </div>
    </DashboardLayoutWrapper>
  );
}
```

### Manual Skeleton Selection

```tsx
import { SkeletonWrapper } from "~/components/skeleton-wrapper";

export default function MyPage() {
  return (
    <SkeletonWrapper>
      {/* Your page content */}
    </SkeletonWrapper>
  );
}
```

## How It Works

1. **Route Detection**: The `useSkeletonLoading` hook detects the current route
2. **Loading State**: Checks if membership is being verified and user is not yet verified
3. **Skeleton Selection**: Maps the current route to the appropriate skeleton component
4. **Conditional Rendering**: Shows skeleton when loading, actual content when ready

## Customization

### Adding New Skeletons

1. Create a new skeleton component in this directory
2. Follow the naming convention: `{PageName}Skeleton`
3. Export it from `index.ts`
4. Add the route mapping in `useSkeletonLoading` hook

### Styling

All skeletons use the base `Skeleton` component from `~/components/ui/skeleton` which provides:
- Consistent animation with `animate-pulse`
- Proper background color with `bg-accent`
- Rounded corners with `rounded-md`

### Best Practices

1. **Match Layout**: Ensure skeleton layout closely matches the actual page layout
2. **Realistic Proportions**: Use appropriate widths and heights for skeleton elements
3. **Consistent Spacing**: Maintain the same spacing as the actual content
4. **Performance**: Keep skeletons lightweight and avoid complex animations

## Integration with Existing System

The skeleton system integrates with:
- `useShopMembership` hook for membership checking
- `useUnifiedShop` hook for shop data loading
- Existing loading states and error handling

## Example

```tsx
// Before (generic loading)
if (isChecking) {
  return <div>Loading...</div>;
}

// After (skeleton loading)
return (
  <DashboardLayoutWrapper>
    <div>Your actual content</div>
  </DashboardLayoutWrapper>
);
```

This provides a much better user experience with contextual loading states that match the expected content layout. 