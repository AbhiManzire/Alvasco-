const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    shippingMethod: {
      type: String,
      enum: ['DHL', 'SEA'],
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    grossProfit: {
      type: Number,
      required: true
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true
    },
    totalGrossProfit: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'BBD'
    }
  },
  terms: {
    payment: {
      type: String,
      default: '50% Deposit to confirm order, Final Payment due on delivery'
    },
    leadTime: {
      type: String,
      default: 'Lead Time is Estimated Only and begins after both deposit and artwork confirmed'
    },
    pricing: {
      type: String,
      default: 'All Pricing is Landed & Duty Free, in Barbados, by Applicable Shipping Method'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  validUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  notes: {
    type: String
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
ProposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate proposal number
ProposalSchema.pre('save', function(next) {
  if (this.isNew && !this.proposalNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.proposalNumber = `PROP-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);

