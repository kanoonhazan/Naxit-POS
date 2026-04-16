
# POS Mobile App – Engineering Specification

## 🧠 Architecture Overview

-   Platform: React Native (Expo preferred for speed)
    
-   Architecture: Offline-first
    
-   Pattern: Feature-based modular architecture
    

----------

## 🏗️ Tech Stack

### Mobile Framework

-   React Native (Expo)
    

### Database

-   SQLite (expo-sqlite)
    

### State Management

-   Zustand (lightweight and fast)
    

### Storage

-   AsyncStorage (for configs & settings)
    

### QR Code

-   react-native-qrcode-svg (generate)
    
-   expo-barcode-scanner (scan)
    

### Printing

-   react-native-thermal-receipt-printer (Bluetooth ESC/POS)
    

----------

## 📂 Folder Structure

src/  
┣ features/  
┃ ┣ sales/  
┃ ┣ products/  
┃ ┣ inventory/  
┃ ┣ reports/  
┃ ┗ settings/  
┃  
┣ components/  
┣ hooks/  
┣ services/  
┣ database/  
┣ utils/  
┗ navigation/

----------

## 🧱 Architecture Pattern

UI → Hooks → Services → SQLite DB

-   UI: Screens & components
    
-   Hooks: Business logic
    
-   Services: DB queries
    
-   DB: SQLite tables
    

----------

## 🗄️ Database Setup

Use SQLite with the following tables:

### products

-   id (TEXT PRIMARY KEY)
    
-   name (TEXT)
    
-   price (REAL)
    
-   quantity (INTEGER)
    
-   sku (TEXT)
    
-   created_at (TEXT)
    

### transactions

-   id (TEXT PRIMARY KEY)
    
-   total_amount (REAL)
    
-   created_at (TEXT)
    

### transaction_items

-   id (TEXT PRIMARY KEY)
    
-   transaction_id (TEXT)
    
-   product_id (TEXT)
    
-   quantity (INTEGER)
    
-   price (REAL)
    

----------

## 🔄 Data Flow Rules

-   No API calls
    
-   All reads/writes from SQLite
    
-   Optimistic UI updates (instant feedback)
    

----------

## ⚡ Performance Rules

-   Use indexes on product_id
    
-   Avoid heavy joins
    
-   Cache frequently accessed data
    

----------

## 🔐 Data Safety

-   Implement local backup (JSON export)
    
-   Restore from file
    

----------

## 🚀 Build Philosophy

-   Ship fast, iterate faster
    
-   No overengineering
    
-   Every feature must directly support sales flow
