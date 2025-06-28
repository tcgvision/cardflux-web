# CardFlux Development Plan: Multi-Franchise TCG Inventory System

## 🎯 **Project Overview**

CardFlux is a comprehensive TCG (Trading Card Game) inventory management system for card shops, supporting multiple franchises with seamless POS functionality and card scanning capabilities.

## 🏗️ **Current Architecture Analysis**

### **Tech Stack** ✅
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** tRPC, Prisma, PostgreSQL
- **Auth:** Clerk (organizations, users, webhooks)
- **UI:** Radix UI, shadcn/ui components
- **State:** TanStack Query, React Hook Form
- **Validation:** Zod schemas

### **Existing Foundation** ✅
- ✅ Multi-tenant shop system with Clerk organizations
- ✅ Role-based permissions (admin/member)
- ✅ Basic inventory management (Product, InventoryItem models)
- ✅ Transaction system (BUYIN/CHECKOUT types)
- ✅ Customer management with store credit
- ✅ Buylist system
- ✅ Scanner page (basic structure)
- ✅ Dashboard with analytics

---

## 📋 **Phase 1: Database Schema Refactor (Week 1) - COMPLETED** ✅

### **1.1 Multi-Franchise Schema Enhancement** ✅
- ✅ Enhanced Shop model with complete address structure
- ✅ Added business contact information and hours
- ✅ POS configuration settings
- ✅ Supported franchises selection
- ✅ Franchise-specific product attributes
- ✅ Improved indexing for performance

### **1.2 Schema Changes Applied** ✅
```sql
-- New Models Added:
- ShopAddress (street, city, state, zip, country)
- ShopContactInfo (phone, email, website, taxId)
- BusinessHours (dayOfWeek, openTime, closeTime)
- POSSettings (scanner, receipts, tax, discounts)
- ShopFranchise (supported franchises per shop)
- ProductFranchiseAttributes (franchise-specific card data)

-- Enhanced Models:
- Shop (removed location, added relations)
- Product (added franchiseAttributes relation)
- InventoryItem (added quantity indexing)
- Transaction (added status indexing)
```

---

## 🚀 **Phase 2: Shop Settings & Configuration (Week 2)**

### **2.1 Enhanced Shop Registration Form**
- **Address Management:** Complete address input with validation
- **Business Information:** Contact details, tax ID, website
- **Business Hours:** Weekly schedule with open/close times
- **Franchise Selection:** Multi-select supported TCG lines
- **POS Configuration:** Scanner settings, receipt templates, tax rates

### **2.2 Shop Settings Page**
- **General Settings:** Shop name, description, contact info
- **Address Management:** Edit shop address
- **Business Hours:** Configure weekly schedule
- **Franchise Management:** Enable/disable TCG lines
- **POS Settings:** Configure scanner, receipts, tax, discounts
- **Store Credit Settings:** Limits, policies, notifications

### **2.3 Implementation Tasks**
1. **Update Shop Router** (`src/server/api/routers/shop.ts`)
   - Add CRUD operations for new models
   - Validation for address and business info
   - Franchise management endpoints

2. **Create Settings Components**
   - `src/app/dashboard/settings/` directory
   - Address form component
   - Business hours editor
   - Franchise selector
   - POS configuration panel

3. **Update Shop Creation Flow**
   - Enhanced onboarding process
   - Step-by-step configuration
   - Validation and error handling

---

## 💰 **Phase 3: POS Mode Development (Week 3-4)**

### **3.1 POS Core Interface**
- **Full-Screen POS Mode:** Touch-friendly interface
- **Transaction Types:** Buy-in vs Checkout modes
- **Cart Management:** Add/remove items, quantity adjustment
- **Customer Selection:** Search and select customers
- **Payment Processing:** Multiple payment methods
- **Receipt Generation:** Customizable templates

### **3.2 POS Features**
- **Real-time Inventory:** Live stock updates
- **Price Lookup:** Market price integration
- **Discount Management:** Percentage and fixed discounts
- **Tax Calculation:** Configurable tax rates
- **Store Credit:** Apply customer credit
- **Transaction History:** Quick access to recent sales

### **3.3 Implementation Tasks**
1. **Create POS Router** (`src/server/api/routers/pos.ts`)
   - Transaction creation with inventory updates
   - Real-time stock validation
   - Payment processing
   - Receipt generation

2. **Build POS Interface**
   - `src/app/dashboard/pos/` directory
   - Full-screen layout
   - Touch-optimized components
   - Customer-facing display option

3. **Inventory Integration**
   - Real-time stock checks
   - Low stock warnings
   - Transaction rollback capabilities
   - Audit trail logging

---

## 📷 **Phase 4: Scanner Integration (Week 5-6)**

### **4.1 Enhanced Scanner Functionality**
- **Multi-Franchise Recognition:** Support for all TCG lines
- **Batch Scanning:** Multiple cards at once
- **Confidence Scoring:** AI-powered card identification
- **Manual Correction:** "Did you mean..." suggestions
- **Price Auto-Population:** Market price lookup
- **Condition Assessment:** Visual condition detection

### **4.2 Scanner-POS Integration**
- **Direct to Cart:** Scan cards directly into POS
- **Inventory Lookup:** Check stock levels during scanning
- **Price Validation:** Compare scanned vs stored prices
- **Condition Tracking:** Record card conditions
- **Error Handling:** Unrecognized card fallback

### **4.3 Implementation Tasks**
1. **Enhance Scanner Router** (`src/server/api/routers/scanner.ts`)
   - Multi-franchise card recognition
   - Batch processing capabilities
   - Confidence scoring
   - Price lookup integration

2. **Update Scanner UI**
   - Enhanced camera interface
   - Batch scanning interface
   - Confidence display
   - Manual correction tools

3. **POS Integration**
   - Direct scanning to cart
   - Real-time inventory updates
   - Price validation
   - Condition tracking

---

## 📊 **Phase 5: Inventory Management (Week 7-8)**

### **5.1 Advanced Inventory Features**
- **Multi-Franchise Filtering:** Filter by TCG line
- **Condition Management:** Track different conditions
- **Stock Alerts:** Low stock notifications
- **Price Tracking:** Market price history
- **Bulk Operations:** Import/export functionality
- **Analytics:** Inventory performance metrics

### **5.2 Inventory Workflows**
- **Receiving:** Process new inventory
- **Adjustments:** Manual stock corrections
- **Transfers:** Move inventory between locations
- **Returns:** Process customer returns
- **Damaged Goods:** Handle damaged inventory

### **5.3 Implementation Tasks**
1. **Enhance Inventory Router** (`src/server/api/routers/inventory.ts`)
   - Multi-franchise filtering
   - Condition management
   - Bulk operations
   - Stock alerts

2. **Update Inventory UI**
   - Enhanced filtering and search
   - Condition management interface
   - Bulk operations tools
   - Analytics dashboard

3. **Integration Features**
   - Scanner integration
   - POS integration
   - Customer management
   - Reporting system

---

## 📈 **Phase 6: Analytics & Reporting (Week 9-10)**

### **6.1 Business Analytics**
- **Sales Analytics:** Revenue trends, top products
- **Inventory Analytics:** Stock turnover, low performers
- **Customer Analytics:** Customer behavior, loyalty
- **Franchise Analytics:** Performance by TCG line
- **Staff Analytics:** Performance metrics

### **6.2 Reporting System**
- **Daily Reports:** Sales, inventory, customers
- **Monthly Reports:** Comprehensive business overview
- **Custom Reports:** Configurable report builder
- **Export Options:** PDF, CSV, Excel
- **Scheduled Reports:** Automated delivery

### **6.3 Implementation Tasks**
1. **Create Analytics Router** (`src/server/api/routers/analytics.ts`)
   - Sales analytics endpoints
   - Inventory analytics
   - Customer analytics
   - Staff performance

2. **Build Analytics Dashboard**
   - Interactive charts and graphs
   - Real-time data updates
   - Customizable widgets
   - Export functionality

3. **Reporting System**
   - Report templates
   - Custom report builder
   - Export functionality
   - Scheduled reports

---

## 🔧 **Phase 7: Advanced Features (Week 11-12)**

### **7.1 Advanced POS Features**
- **Customer Display:** Second screen for customers
- **Barcode Scanning:** Support for barcode scanners
- **NFC Support:** Contactless payment integration
- **Offline Mode:** Work without internet
- **Multi-Location:** Support for multiple shops

### **7.2 Integration Features**
- **Price Sync:** Automatic price updates
- **Inventory Sync:** Real-time inventory updates
- **Customer Sync:** Customer data synchronization
- **Payment Integration:** Stripe, Square, etc.
- **Shipping Integration:** USPS, FedEx, etc.

### **7.3 Implementation Tasks**
1. **Advanced POS Features**
   - Customer display interface
   - Barcode scanner support
   - NFC payment integration
   - Offline functionality

2. **Integration APIs**
   - Price sync services
   - Payment processors
   - Shipping carriers
   - Third-party services

3. **Performance Optimization**
   - Database optimization
   - Caching strategies
   - CDN integration
   - Load balancing

---

## 🧪 **Testing Strategy**

### **7.1 Unit Testing**
- **API Endpoints:** tRPC router testing
- **Database Operations:** Prisma model testing
- **Component Testing:** React component testing
- **Utility Functions:** Helper function testing

### **7.2 Integration Testing**
- **End-to-End Flows:** Complete user journeys
- **POS Workflows:** Transaction processing
- **Scanner Integration:** Card recognition
- **Inventory Management:** Stock operations

### **7.3 Performance Testing**
- **Load Testing:** High-volume transactions
- **Stress Testing:** System limits
- **Database Performance:** Query optimization
- **Frontend Performance:** React optimization

---

## 🚀 **Deployment Strategy**

### **8.1 Staging Environment**
- **Database:** Staging PostgreSQL instance
- **Frontend:** Vercel staging deployment
- **Backend:** Vercel API routes
- **Testing:** Automated testing pipeline

### **8.2 Production Environment**
- **Database:** Production PostgreSQL with backups
- **Frontend:** Vercel production deployment
- **CDN:** Global content delivery
- **Monitoring:** Error tracking and analytics

### **8.3 CI/CD Pipeline**
- **Automated Testing:** Run tests on every commit
- **Code Quality:** Linting and formatting
- **Database Migrations:** Automated schema updates
- **Deployment:** Automated production deployment

---

## 📋 **Development Priorities**

### **High Priority (Weeks 1-4)**
1. ✅ Database schema refactor
2. Shop settings and configuration
3. POS core functionality
4. Basic scanner integration

### **Medium Priority (Weeks 5-8)**
1. Advanced inventory management
2. Enhanced scanner features
3. Analytics and reporting
4. Performance optimization

### **Low Priority (Weeks 9-12)**
1. Advanced POS features
2. Third-party integrations
3. Multi-location support
4. Advanced analytics

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Performance:** < 2s page load times
- **Uptime:** > 99.9% availability
- **Error Rate:** < 0.1% error rate
- **Database:** < 100ms query times

### **Business Metrics**
- **User Adoption:** 90% of staff using POS daily
- **Transaction Speed:** < 30s average transaction time
- **Inventory Accuracy:** > 99% stock accuracy
- **Customer Satisfaction:** > 4.5/5 rating

---

## 🔄 **Iteration Plan**

### **Sprint 1 (Week 1-2): Foundation**
- ✅ Database schema refactor
- Shop settings implementation
- Basic POS interface

### **Sprint 2 (Week 3-4): Core POS**
- Transaction processing
- Inventory integration
- Customer management

### **Sprint 3 (Week 5-6): Scanner**
- Enhanced scanner functionality
- POS integration
- Error handling

### **Sprint 4 (Week 7-8): Inventory**
- Advanced inventory features
- Analytics dashboard
- Reporting system

### **Sprint 5 (Week 9-10): Polish**
- Performance optimization
- UI/UX improvements
- Bug fixes

### **Sprint 6 (Week 11-12): Advanced**
- Advanced features
- Third-party integrations
- Final testing and deployment

---

This development plan builds upon your existing solid foundation and follows modern web development best practices. Each phase is designed to deliver working functionality while maintaining code quality and user experience. 