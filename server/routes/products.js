const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const PricingEngine = require('../utils/PricingEngine');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'active' } = req.query;
    const query = { status };
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('supplier', 'name company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name company');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', [
  auth,
  authorize('supplier', 'admin'),
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('excelStructure.casePack.value').isNumeric().withMessage('Case Pack must be a number'),
  body('excelStructure.weight.value').isNumeric().withMessage('Weight must be a number'),
  body('excelStructure.price.value').isNumeric().withMessage('Price must be a number'),
  body('excelStructure.duties.value').isNumeric().withMessage('Duties must be a number'),
  body('excelStructure.profitMargin.value').isNumeric().withMessage('Profit Margin must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      supplier: req.user.userId
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', [
  auth,
  authorize('supplier', 'admin'),
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('excelStructure.casePack.value').optional().isNumeric(),
  body('excelStructure.weight.value').optional().isNumeric(),
  body('excelStructure.price.value').optional().isNumeric(),
  body('excelStructure.duties.value').optional().isNumeric(),
  body('excelStructure.profitMargin.value').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user can update this product
    if (product.supplier.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    });

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', [auth, authorize('supplier', 'admin')], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user can delete this product
    if (product.supplier.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate pricing for a product
router.post('/:id/calculate-pricing', [
  auth,
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('shippingMethod').optional().isIn(['DHL', 'SEA']).withMessage('Invalid shipping method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { quantity, shippingMethod } = req.body;

    if (shippingMethod) {
      // Calculate for specific shipping method
      const pricing = PricingEngine.calculateLandedCost(product, quantity, shippingMethod);
      res.json({
        productName: product.name,
        quantity,
        shippingMethod,
        pricing
      });
    } else {
      // Calculate for both shipping methods
      const pricing = PricingEngine.calculateAllPricing(product, quantity);
      res.json(pricing);
    }
  } catch (error) {
    console.error('Calculate pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pricing summary
router.get('/:id/pricing-summary', auth, async (req, res) => {
  try {
    const { quantity = 100 } = req.query;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const summary = PricingEngine.getPricingSummary(product, parseInt(quantity));
    res.json(summary);
  } catch (error) {
    console.error('Get pricing summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search products
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .populate('supplier', 'name company')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Product.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

