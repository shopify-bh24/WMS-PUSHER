# Shopify-WMS Integration

A professional web application that connects Shopify with warehouse management systems (WMS) for seamless order processing and inventory control.

## Features

- **Order Synchronization**: Automatically sync orders between Shopify and your warehouse management system in real-time
- **Inventory Management**: Keep inventory levels accurate across all platforms with automated updates
- **User Authentication**: Secure login system with role-based access (admin and warehouse staff)
- **Order Management UI**: View, edit, and process orders with a clean, intuitive interface
- **WMS Integration**: Connect to warehouse systems using ODBC/JDBC or file-based imports

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS for responsive UI
- **Authentication**: NextAuth.js for secure user authentication
- **API Routes**: Next.js API routes for backend functionality
- **Data Fetching**: Axios for API requests

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Demo Credentials

Use these credentials to test the application:

- **Admin User**:
  - Username: admin
  - Password: password

- **Warehouse Staff**:
  - Username: warehouse
  - Password: password

## Project Structure

- `/src/app` - Next.js application pages and API routes
- `/src/app/api` - Backend API endpoints
- `/src/app/dashboard` - Main dashboard interface
- `/src/app/orders` - Order management pages
- `/src/app/inventory` - Inventory management
- `/src/types` - TypeScript type definitions

## API Endpoints

- `/api/auth/[...nextauth]` - Authentication endpoints
- `/api/shopify/sync` - Shopify order synchronization
- `/api/wms/connect` - WMS connection and data exchange

## Deployment

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## License

This project is licensed under the terms of the agreement between the client and developer.
