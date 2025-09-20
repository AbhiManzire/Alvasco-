const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Client = require('./models/Client');
const Proposal = require('./models/Proposal');

// Seed database function
async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});
    await Proposal.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = [];
    const userData = [
      { email: 'admin@alvasco.com', password: 'admin123', role: 'admin', name: 'Admin User' },
      { email: 'sales@alvasco.com', password: 'sales123', role: 'sales', name: 'Sales User' },
      { email: 'supplier@alvasco.com', password: 'supplier123', role: 'supplier', name: 'Supplier User' },
      { email: 'client@btmi.com', password: 'client123', role: 'client', name: 'Client User' }
    ];

    for (const userInfo of userData) {
      const hashedPassword = await bcrypt.hash(userInfo.password, 10);
      const user = new User({
        name: userInfo.name,
        email: userInfo.email,
        password: hashedPassword,
        role: userInfo.role
      });
      await user.save();
      users.push(user);
      console.log(`Created user: ${userInfo.email}`);
    }

    // Create sample products
    const products = [];
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      products.push(product);
      console.log(`Created product: ${product.name}`);
    }

    // Create sample clients
    const clients = [];
    const clientData = [
      {
        name: 'John Smith',
        company: 'BTMI Conference',
        email: 'john.smith@btmi.com',
        phone: '+1-246-555-0123',
        businessType: 'government'
      },
      {
        name: 'Sarah Johnson',
        company: 'Caribbean Tourism Board',
        email: 'sarah.johnson@ctb.com',
        phone: '+1-246-555-0456',
        businessType: 'government'
      },
      {
        name: 'Michael Brown',
        company: 'Island Promotions Ltd',
        email: 'michael.brown@islandpromo.com',
        phone: '+1-246-555-0789',
        businessType: 'retail'
      }
    ];

    for (const clientInfo of clientData) {
      const client = new Client(clientInfo);
      await client.save();
      clients.push(client);
      console.log(`Created client: ${client.name}`);
    }

    // Create sample proposal
    const proposal = new Proposal({
      proposalNumber: 'PROP-20240920-001',
      client: clients[0]._id,
      createdBy: users.find(u => u.role === 'sales')._id,
      title: 'BTMI Conference Promotional Items',
      description: 'Promotional items for BTMI Conference 2024',
      items: [
        {
          product: products[0]._id,
          quantity: 300,
          shippingMethod: 'DHL',
        }
      ]
    });
    await proposal.save();
    console.log('Created proposal: PROP-20240920-001');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@alvasco.com / admin123');
    console.log('Sales: sales@alvasco.com / sales123');
    console.log('Supplier: supplier@alvasco.com / supplier123');
    console.log('Client: client@btmi.com / client123');

    return { users, products, clients, proposal };
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

// Sample data based on the product catalogs provided
const sampleProducts = [
  {
    name: "Calendar",
    description: "7in x 5.5in | 13 Sheets | 350G White Card | Full Colour Print",
    category: "Promotional Items",
    image: "",
    excelStructure: {
      casePack: { value: 100, unit: "/ctn" },
      cartonDimensions: { length: 45, width: 35, depth: 22, unit: "cm" },
      weight: { value: 15, unit: "kg" },
      prodLeadTime: { value: 15, unit: "days" },
      price: { value: 1.10, currency: "USD" }, // 500 pcs price
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 30, unit: "%" }, // Default from Excel
      profitOverride: { value: 0, unit: "%" }, // OFF by default
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "350G White Card",
      size: "7in x 5.5in",
      sheets: "13 Sheets",
      imprint: "Full Colour Print"
    }
  },
  {
    name: "Custom Viewfinder",
    description: "13cm x 9cm | 9cm Reel, Plastic, 1-Colour Logo Printin on Viewmaster & Custom Reel",
    category: "Promotional Items",
    image: "",
    excelStructure: {
      casePack: { value: 100, unit: "/ctn" },
      cartonDimensions: { length: 45, width: 35, depth: 22, unit: "cm" },
      weight: { value: 15, unit: "kg" },
      prodLeadTime: { value: 25, unit: "days" },
      price: { value: 0.90, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "Plastic",
      size: "13cm x 9cm",
      imprint: "1-Colour Logo Printin on Viewmaster & Custom Reel"
    }
  },
  {
    name: "Tote Bag Option 1",
    description: "33cm W x 31cm H x 10cm Gusset, 16OZ Cotton | Pocket, Lining & Zipper, 1-Colour Screen Print Logo on One Side",
    category: "Bags & Accessories",
    image: "",
    excelStructure: {
      casePack: { value: 50, unit: "/ctn" },
      cartonDimensions: { length: 50, width: 40, depth: 30, unit: "cm" },
      weight: { value: 12, unit: "kg" },
      prodLeadTime: { value: 25, unit: "days" },
      price: { value: 1.20, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "16OZ Cotton",
      size: "33cm W x 31cm H x 10cm Gusset",
      imprint: "1-Colour Screen Print Logo on One Side"
    }
  },
  {
    name: "Tote Bag Option 2",
    description: "46cm W x 35cm H x 14cm Gusset, 400GSM Natural Jute, Full Colour Printing on One (1) Side",
    category: "Bags & Accessories",
    image: "",
    excelStructure: {
      casePack: { value: 30, unit: "/ctn" },
      cartonDimensions: { length: 60, width: 45, depth: 35, unit: "cm" },
      weight: { value: 18, unit: "kg" },
      prodLeadTime: { value: 25, unit: "days" },
      price: { value: 1.50, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "400GSM Natural Jute",
      size: "46cm W x 35cm H x 14cm Gusset",
      imprint: "Full Colour Printing on One (1) Side"
    }
  },
  {
    name: "A5 Hard Cover PU Notebook",
    description: "A5 | 80 Sheets, PU Material, One (1) Position Debossed Logo",
    category: "Office Supplies",
    image: "",
    excelStructure: {
      casePack: { value: 200, unit: "/ctn" },
      cartonDimensions: { length: 40, width: 30, depth: 25, unit: "cm" },
      weight: { value: 20, unit: "kg" },
      prodLeadTime: { value: 25, unit: "days" },
      price: { value: 0.85, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "PU Material",
      size: "A5 | 80 Sheets",
      imprint: "One (1) Position Debossed Logo"
    }
  },
  {
    name: "16GB Custom Laser Engraved Flash Drive",
    description: "Acrylic & Wood (USB), Custom Packaging Box, 1-Position Laser Engraved Logo on USB, Logo Printing on Packaging Box",
    category: "Electronics",
    image: "",
    excelStructure: {
      casePack: { value: 500, unit: "/ctn" },
      cartonDimensions: { length: 35, width: 25, depth: 20, unit: "cm" },
      weight: { value: 8, unit: "kg" },
      prodLeadTime: { value: 25, unit: "days" },
      price: { value: 2.50, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "Acrylic & Wood",
      size: "16GB",
      imprint: "1-Position Laser Engraved Logo on USB, Logo Printing on Packaging Box"
    }
  },
  {
    name: "Golf Umbrella (Multi-colored/Branded)",
    description: "150cm, 190T Pongee + Fiberglass Rib + EVA handle, Full Colour Sublimation Print",
    category: "Outdoor & Sports",
    image: "",
    excelStructure: {
      casePack: { value: 20, unit: "/ctn" },
      cartonDimensions: { length: 80, width: 20, depth: 20, unit: "cm" },
      weight: { value: 25, unit: "kg" },
      prodLeadTime: { value: 30, unit: "days" },
      price: { value: 3.50, currency: "USD" },
      duties: { value: 20, unit: "%" },
      profitMargin: { value: 25, unit: "%" },
      weightPerPiece: { value: 0.15, unit: "kg" }
    },
    specifications: {
      material: "190T Pongee + Fiberglass Rib + EVA handle",
      size: "150cm",
      imprint: "Full Colour Sublimation Print"
    }
  }
];

const sampleClients = [
  {
    name: "John Smith",
    company: "BTMI Conference",
    email: "john.smith@btmi.com",
    phone: "+1-246-555-0123",
    address: {
      street: "123 Broad Street",
      city: "Bridgetown",
      state: "St. Michael",
      country: "Barbados",
      postalCode: "BB11000"
    },
    businessType: "government",
    contactPerson: {
      name: "John Smith",
      position: "Event Coordinator",
      email: "john.smith@btmi.com",
      phone: "+1-246-555-0123"
    }
  },
  {
    name: "Sarah Johnson",
    company: "Caribbean Tourism Board",
    email: "sarah.johnson@ctb.com",
    phone: "+1-246-555-0456",
    address: {
      street: "456 Bay Street",
      city: "Bridgetown",
      state: "St. Michael",
      country: "Barbados",
      postalCode: "BB11001"
    },
    businessType: "government",
    contactPerson: {
      name: "Sarah Johnson",
      position: "Marketing Director",
      email: "sarah.johnson@ctb.com",
      phone: "+1-246-555-0456"
    }
  },
  {
    name: "Michael Brown",
    company: "Island Promotions Ltd",
    email: "michael.brown@islandpromo.com",
    phone: "+1-246-555-0789",
    address: {
      street: "789 Harbour Road",
      city: "Speightstown",
      state: "St. Peter",
      country: "Barbados",
      postalCode: "BB12000"
    },
    businessType: "retail",
    contactPerson: {
      name: "Michael Brown",
      position: "Owner",
      email: "michael.brown@islandpromo.com",
      phone: "+1-246-555-0789"
    }
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@alvasco.com",
    password: "admin123",
    role: "admin",
    company: "Alvasco Ltd"
  },
  {
    name: "Sales Manager",
    email: "sales@alvasco.com",
    password: "sales123",
    role: "sales",
    company: "Alvasco Ltd"
  },
  {
    name: "Supplier Rep",
    email: "supplier@alvasco.com",
    password: "supplier123",
    role: "supplier",
    company: "Alvasco Suppliers"
  },
  {
    name: "Client User",
    email: "client@btmi.com",
    password: "client123",
    role: "client",
    company: "BTMI Conference"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alvasco-procurement');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});
    await Proposal.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create products
    const products = [];
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        supplier: users.find(u => u.role === 'supplier')._id
      });
      await product.save();
      products.push(product);
      console.log(`Created product: ${product.name}`);
    }

    // Create clients
    const clients = [];
    for (const clientData of sampleClients) {
      const client = new Client({
        ...clientData,
        createdBy: users.find(u => u.role === 'sales')._id
      });
      await client.save();
      clients.push(client);
      console.log(`Created client: ${client.name}`);
    }

    // Create sample proposal
    const proposal = new Proposal({
      proposalNumber: "PROP-20240920-001",
      client: clients[0]._id,
      createdBy: users.find(u => u.role === 'sales')._id,
      title: "BTMI Conference Promotional Items",
      description: "Promotional items for BTMI Conference 2024",
      items: [
        {
          product: products[0]._id,
          quantity: 300,
          shippingMethod: "DHL",
          unitPrice: 20.85,
          totalPrice: 6255.00,
          grossProfit: 1251.00
        },
        {
          product: products[1]._id,
          quantity: 300,
          shippingMethod: "DHL",
          unitPrice: 21.55,
          totalPrice: 6465.00,
          grossProfit: 1293.00
        }
      ],
      totals: {
        subtotal: 12720.00,
        totalGrossProfit: 2544.00,
        currency: "BBD"
      },
      status: "draft"
    });
    await proposal.save();
    console.log(`Created proposal: ${proposal.proposalNumber}`);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@alvasco.com / admin123');
    console.log('Sales: sales@alvasco.com / sales123');
    console.log('Supplier: supplier@alvasco.com / supplier123');
    console.log('Client: client@btmi.com / client123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Export the seedData function
module.exports = { seedData };

// Run the seeder
seedDatabase();

