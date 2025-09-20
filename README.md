# Alvasco Procurement System

A comprehensive digital platform that transforms manual, Excel-based procurement operations into a streamlined system for product sourcing, pricing calculations, and client proposal generation.

## Features

### Core Functionality
- **Product Management**: Complete Excel structure replication with all columns
- **Automated Pricing Engine**: Exact Excel calculations with DHL/Sea shipping options
- **Client Management**: Comprehensive client database with contact information
- **Proposal Generation**: Professional proposal creation and management
- **Multi-Role Authentication**: Suppliers, Sales Team, Clients, and Administrators

### Pricing Engine
The system replicates your Excel calculations exactly:
- Case Pack calculations
- Carton weight and dimensions
- Shipping costs (DHL: $0.15/kg min $25, Sea: $0.08/kg min $15)
- Duties and taxes
- Profit margins
- Currency conversion (USD to BBD at 2.02 rate)

## Technology Stack

- **Frontend**: React.js with TypeScript, Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based multi-role system

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the `server` directory:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alvasco-procurement
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start the backend server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

### Database Seeding

To populate the database with sample data:

```bash
node server/seedData.js
```

This will create:
- Sample products from your catalogs
- Test users for all roles
- Sample clients
- A sample proposal

## Sample Login Credentials

- **Admin**: admin@alvasco.com / admin123
- **Sales**: sales@alvasco.com / sales123
- **Supplier**: supplier@alvasco.com / supplier123
- **Client**: client@btmi.com / client123

## Usage

### For Suppliers
- Upload and manage product catalogs
- Set pricing parameters (case pack, weight, duties, profit margins)
- View calculated pricing for different quantities and shipping methods

### For Sales Team
- Browse product catalog
- Create and manage client proposals
- Use pricing calculator for quotes
- Track proposal status

### For Clients
- View proposals sent to them
- Accept or reject proposals
- Access pricing information

### For Administrators
- Full system access
- User management
- System configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/calculate-pricing` - Calculate pricing

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Proposals
- `GET /api/proposals` - Get all proposals
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `PATCH /api/proposals/:id/status` - Update proposal status

### Pricing
- `POST /api/pricing/calculate` - Calculate pricing for multiple products
- `GET /api/pricing/compare/:productId` - Get pricing comparison
- `POST /api/pricing/bulk` - Bulk pricing calculation

## Development

### Running in Development Mode

1. Start both backend and frontend:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Building for Production

1. Build the frontend:
```bash
npm run build
```

2. The built files will be in the `client/build` directory and will be served by the Express server in production.

## Project Structure

```
alvasco-procurement-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── middleware/        # Express middleware
│   └── index.js
├── package.json
└── README.md
```

## Key Features Demonstrated

### Exact Excel Replication
The pricing engine replicates your Excel calculations exactly:
- Same formulas and calculations
- Same data types and formats
- Same output structure
- Real-time automation

### Sample Data
The system includes sample data from your product catalogs:
- Custom Viewfinders
- Tote Bags (multiple options)
- A5 Notebooks
- Flash Drives
- Golf Umbrellas

### Professional UI
- Material-UI components for modern look
- Responsive design for all devices
- Role-based navigation
- Intuitive user experience

## Testing the System

1. Start the application
2. Login with any of the sample credentials
3. Navigate through different sections based on your role
4. Test the pricing calculator with different products and quantities
5. Create proposals and see the automated calculations
6. Verify that calculations match your Excel spreadsheet

## Support

For questions or issues, please refer to the code comments or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: September 2024  
**Status**: Demo Ready

