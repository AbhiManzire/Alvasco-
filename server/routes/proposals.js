const express = require('express');
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const Product = require('../models/Product');
const Client = require('../models/Client');
const PricingEngine = require('../utils/PricingEngine');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all proposals
router.get('/', [auth, authorize('sales', 'admin')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const proposals = await Proposal.find(query)
      .populate('client', 'name company email')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name description image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Proposal.countDocuments(query);

    res.json({
      proposals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single proposal
router.get('/:id', [auth, authorize('sales', 'admin', 'client')], async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('client', 'name company email phone address')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name description image specifications');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if client can view this proposal
    if (req.user.role === 'client') {
      const client = await Client.findById(proposal.client._id);
      if (!client || client.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to view this proposal' });
      }
    }

    res.json(proposal);
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new proposal
router.post('/', [
  auth,
  authorize('sales', 'admin'),
  body('client').isMongoId().withMessage('Valid client ID is required'),
  body('title').trim().isLength({ min: 1 }).withMessage('Proposal title is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('items.*.shippingMethod').isIn(['DHL', 'SEA']).withMessage('Invalid shipping method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { client, title, description, items, notes } = req.body;

    // Verify client exists
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Process items and calculate pricing
    const processedItems = [];
    let subtotal = 0;
    let totalGrossProfit = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      const pricing = PricingEngine.calculateLandedCost(product, item.quantity, item.shippingMethod);
      
      const processedItem = {
        product: item.product,
        quantity: item.quantity,
        shippingMethod: item.shippingMethod,
        unitPrice: pricing.unitPriceBBD,
        totalPrice: pricing.totalPriceBBD,
        grossProfit: pricing.totalGrossProfitBBD
      };

      processedItems.push(processedItem);
      subtotal += pricing.totalPriceBBD;
      totalGrossProfit += pricing.totalGrossProfitBBD;
    }

    const proposal = new Proposal({
      client,
      createdBy: req.user.userId,
      title,
      description,
      items: processedItems,
      totals: {
        subtotal,
        totalGrossProfit,
        currency: 'BBD'
      },
      notes
    });

    await proposal.save();

    // Populate the proposal for response
    await proposal.populate([
      { path: 'client', select: 'name company email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'items.product', select: 'name description image' }
    ]);

    res.status(201).json({
      message: 'Proposal created successfully',
      proposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update proposal
router.put('/:id', [
  auth,
  authorize('sales', 'admin'),
  body('title').optional().trim().isLength({ min: 1 }),
  body('items').optional().isArray({ min: 1 }),
  body('items.*.product').optional().isMongoId(),
  body('items.*.quantity').optional().isNumeric(),
  body('items.*.shippingMethod').optional().isIn(['DHL', 'SEA'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if proposal can be updated
    if (proposal.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot update accepted proposal' });
    }

    const { title, description, items, notes } = req.body;

    if (title) proposal.title = title;
    if (description) proposal.description = description;
    if (notes) proposal.notes = notes;

    // Recalculate if items are updated
    if (items) {
      const processedItems = [];
      let subtotal = 0;
      let totalGrossProfit = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }

        const pricing = PricingEngine.calculateLandedCost(product, item.quantity, item.shippingMethod);
        
        const processedItem = {
          product: item.product,
          quantity: item.quantity,
          shippingMethod: item.shippingMethod,
          unitPrice: pricing.unitPriceBBD,
          totalPrice: pricing.totalPriceBBD,
          grossProfit: pricing.totalGrossProfitBBD
        };

        processedItems.push(processedItem);
        subtotal += pricing.totalPriceBBD;
        totalGrossProfit += pricing.totalGrossProfitBBD;
      }

      proposal.items = processedItems;
      proposal.totals = {
        subtotal,
        totalGrossProfit,
        currency: 'BBD'
      };
    }

    await proposal.save();

    res.json({
      message: 'Proposal updated successfully',
      proposal
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update proposal status
router.patch('/:id/status', [
  auth,
  authorize('sales', 'admin', 'client'),
  body('status').isIn(['draft', 'sent', 'accepted', 'rejected', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check authorization for status change
    if (req.user.role === 'client' && !['accepted', 'rejected'].includes(req.body.status)) {
      return res.status(403).json({ message: 'Clients can only accept or reject proposals' });
    }

    proposal.status = req.body.status;
    await proposal.save();

    res.json({
      message: 'Proposal status updated successfully',
      proposal
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete proposal
router.delete('/:id', [auth, authorize('sales', 'admin')], async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    if (proposal.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot delete accepted proposal' });
    }

    await Proposal.findByIdAndDelete(req.params.id);

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate proposal PDF (placeholder)
router.get('/:id/pdf', [auth, authorize('sales', 'admin', 'client')], async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('client', 'name company email phone address')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name description image specifications');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // For now, return the proposal data
    // In a real implementation, you would generate a PDF here
    res.json({
      message: 'PDF generation not implemented yet',
      proposal
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

