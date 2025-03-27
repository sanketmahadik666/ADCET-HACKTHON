const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const Toilet = require('../models/Toilet');
const auth = require('../middleware/auth');

// Add new toilet with QR code (protected route)
router.post('/toilet/add', auth, async (req, res) => {
  try {
    const { name, location, description } = req.body;
    
    // Create toilet document
    const toilet = new Toilet({
      name,
      location,
      description
    });

    // Generate unique toiletId
    const toiletId = toilet._id.toString();
    
    // Create QR code data
    const qrData = {
      toiletId,
      name,
      location,
      timestamp: new Date().toISOString()
    };

    // Generate QR code file path
    const qrFileName = `toilet_${toiletId}.png`;
    const qrFilePath = path.join(__dirname, '../public/qr', qrFileName);

    // Generate QR code and save to file
    await QRCode.toFile(qrFilePath, JSON.stringify(qrData), {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 400,
      margin: 2
    });

    // Save QR code path to toilet document
    toilet.qrCode = `/qr/${qrFileName}`;
    await toilet.save();

    res.status(201).json({
      message: 'Toilet added successfully',
      toilet: {
        ...toilet.toObject(),
        qrCodeUrl: `${req.protocol}://${req.get('host')}${toilet.qrCode}`
      }
    });
  } catch (error) {
    console.error('Error adding toilet:', error);
    res.status(500).json({ message: 'Server error while adding toilet' });
  }
});

// Get all toilets
router.get('/toilets', async (req, res) => {
  try {
    const toilets = await Toilet.find();
    res.json(toilets);
  } catch (error) {
    console.error('Error fetching toilets:', error);
    res.status(500).json({ message: 'Server error while fetching toilets' });
  }
});

// Get toilet by ID
router.get('/toilet/:id', async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) {
      return res.status(404).json({ message: 'Toilet not found' });
    }
    res.json(toilet);
  } catch (error) {
    console.error('Error fetching toilet:', error);
    res.status(500).json({ message: 'Server error while fetching toilet' });
  }
});

// Update toilet (protected route)
router.put('/toilet/:id', auth, async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) {
      return res.status(404).json({ message: 'Toilet not found' });
    }

    // Update toilet details
    toilet.name = req.body.name || toilet.name;
    toilet.location = req.body.location || toilet.location;
    toilet.description = req.body.description || toilet.description;

    await toilet.save();
    res.json(toilet);
  } catch (error) {
    console.error('Error updating toilet:', error);
    res.status(500).json({ message: 'Server error while updating toilet' });
  }
});

// Delete toilet (protected route)
router.delete('/toilet/:id', auth, async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) {
      return res.status(404).json({ message: 'Toilet not found' });
    }

    // Delete QR code file
    if (toilet.qrCode) {
      const qrFilePath = path.join(__dirname, '../public', toilet.qrCode);
      try {
        await fs.unlink(qrFilePath);
      } catch (error) {
        console.error('Error deleting QR code file:', error);
      }
    }

    // Delete toilet document
    await toilet.deleteOne();
    res.json({ message: 'Toilet deleted successfully' });
  } catch (error) {
    console.error('Error deleting toilet:', error);
    res.status(500).json({ message: 'Server error while deleting toilet' });
  }
});

module.exports = router; 