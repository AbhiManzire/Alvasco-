const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all clients
router.get('/', [auth, authorize('sales', 'admin')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const query = { status };

    const clients = await Client.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single client
router.get('/:id', [auth, authorize('sales', 'admin')], async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new client
router.post('/', [
  auth,
  authorize('sales', 'admin'),
  body('name').trim().isLength({ min: 1 }).withMessage('Client name is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('businessType').optional().isIn(['retail', 'wholesale', 'corporate', 'government', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clientData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const client = new Client(clientData);
    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update client
router.put('/:id', [
  auth,
  authorize('sales', 'admin'),
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 1 }),
  body('businessType').optional().isIn(['retail', 'wholesale', 'corporate', 'government', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        client[key] = req.body[key];
      }
    });

    await client.save();

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete client
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search clients
router.get('/search/:query', [auth, authorize('sales', 'admin')], async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const clients = await Client.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Client.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    });

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

