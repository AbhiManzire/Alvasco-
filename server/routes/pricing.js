const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const PricingEngine = require('../utils/PricingEngine');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Calculate pricing for multiple products
router.post('/calculate', [
  auth,
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('items.*.shippingMethod').isIn(['DHL', 'SEA']).withMessage('Invalid shipping method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items } = req.body;
    const results = [];
    let grandTotal = 0;
    let grandTotalProfit = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const pricing = PricingEngine.calculateLandedCost(product, item.quantity, item.shippingMethod);
      
      results.push({
        product: {
          id: product._id,
          name: product.name,
          description: product.description,
          image: product.image
        },
        quantity: item.quantity,
        shippingMethod: item.shippingMethod,
        pricing: {
          unitPrice: `BBD$${pricing.unitPriceBBD.toFixed(2)}`,
          totalPrice: `BBD$${pricing.totalPriceBBD.toFixed(2)}`,
          grossProfit: `BBD$${pricing.totalGrossProfitBBD.toFixed(2)}`,
          leadTime: `${product.excelStructure.prodLeadTime.value} days`
        },
        details: pricing
      });

      grandTotal += pricing.totalPriceBBD;
      grandTotalProfit += pricing.totalGrossProfitBBD;
    }

    res.json({
      items: results,
      summary: {
        grandTotal: `BBD$${grandTotal.toFixed(2)}`,
        grandTotalProfit: `BBD$${grandTotalProfit.toFixed(2)}`,
        itemCount: results.length
      }
    });
  } catch (error) {
    console.error('Calculate pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pricing comparison for a product
router.get('/compare/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 100 } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const summary = PricingEngine.getPricingSummary(product, parseInt(quantity));
    res.json(summary);
  } catch (error) {
    console.error('Get pricing comparison error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk pricing calculation
router.post('/bulk', [
  auth,
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('products.*.quantity').isNumeric().withMessage('Quantity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products } = req.body;
    const results = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        results.push({
          productId: item.productId,
          error: 'Product not found'
        });
        continue;
      }

      const dhlPricing = PricingEngine.calculateLandedCost(product, item.quantity, 'DHL');
      const seaPricing = PricingEngine.calculateLandedCost(product, item.quantity, 'SEA');

      results.push({
        product: {
          id: product._id,
          name: product.name,
          description: product.description
        },
        quantity: item.quantity,
        pricing: {
          byDHL: {
            unitPrice: `BBD$${dhlPricing.unitPriceBBD.toFixed(2)}`,
            totalPrice: `BBD$${dhlPricing.totalPriceBBD.toFixed(2)}`,
            grossProfit: `BBD$${dhlPricing.totalGrossProfitBBD.toFixed(2)}`
          },
          bySEA: {
            unitPrice: `BBD$${seaPricing.unitPriceBBD.toFixed(2)}`,
            totalPrice: `BBD$${seaPricing.totalPriceBBD.toFixed(2)}`,
            grossProfit: `BBD$${seaPricing.totalGrossProfitBBD.toFixed(2)}`
          }
        }
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Bulk pricing calculation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pricing engine configuration
router.get('/config', auth, async (req, res) => {
  try {
    res.json({
      shippingRates: {
        DHL: {
          rate: 0.15,
          minimum: 25.00,
          currency: 'USD'
        },
        SEA: {
          rate: 0.08,
          minimum: 15.00,
          currency: 'USD'
        }
      },
      exchangeRate: 2.02,
      currency: 'BBD'
    });
  } catch (error) {
    console.error('Get pricing config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

