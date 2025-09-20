const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Basic Product Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  
  // Excel Structure - Exact replication
  excelStructure: {
    casePack: {
      value: { type: Number, required: true },
      unit: { type: String, default: '/ctn' }
    },
    cartonDimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      depth: { type: Number, required: true },
      unit: { type: String, default: 'cm' }
    },
    weight: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'kg' }
    },
    prodLeadTime: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'days' }
    },
    quantity: {
      type: Number,
      default: 0
    },
    price: {
      value: { type: Number, required: true },
      currency: { type: String, default: 'USD' }
    },
    setupCost: {
      value: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    duties: {
      value: { type: Number, required: true },
      unit: { type: String, default: '%' }
    },
    weightPerPiece: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'kg' }
    },
    profitOverride: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: '%' }
    },
    profitMargin: {
      value: { type: Number, required: true },
      unit: { type: String, default: '%' }
    }
  },
  
  // Calculated Fields
  calculatedPricing: {
    unitPriceLanded: {
      byDHL: { type: Number, default: 0 },
      bySEA: { type: Number, default: 0 }
    },
    totalPriceLanded: {
      byDHL: { type: Number, default: 0 },
      bySEA: { type: Number, default: 0 }
    },
    totalGrossProfit: {
      byDHL: { type: Number, default: 0 },
      bySEA: { type: Number, default: 0 }
    }
  },
  
  // Additional Product Details
  specifications: {
    material: String,
    color: String,
    size: String,
    imprint: String,
    packaging: String
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);

