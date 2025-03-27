const express = require('express');
const router = express.Router();
const Toilet = require('../models/Toilet');
const auth = require('../middleware/auth');

// Get all toilets (for QR codes and map)
router.get('/all', async (req, res) => {
    try {
        console.log('Fetching all toilets...');
        const toilets = await Toilet.find({ isActive: true })
            .select('name location coordinates averageRating totalReviews _id')
            .lean();
        
        console.log(`Found ${toilets.length} toilets:`, toilets);
        res.json(toilets);
    } catch (error) {
        console.error('Error fetching toilets:', error);
        res.status(500).json({ 
            message: 'Error fetching toilets', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get toilets for map view
router.get('/map', async (req, res) => {
    try {
        console.log('Fetching toilets for map...');
        const toilets = await Toilet.find({ isActive: true })
            .select('name location coordinates averageRating totalReviews description facilities _id')
            .lean();
        
        console.log(`Found ${toilets.length} toilets for map:`, toilets);
        res.json(toilets);
    } catch (error) {
        console.error('Error fetching map toilets:', error);
        res.status(500).json({ 
            message: 'Error fetching map data', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get specific toilet by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching toilet by ID:', req.params.id);
        const toilet = await Toilet.findById(req.params.id)
            .select('name location description coordinates facilities averageRating totalReviews');
        
        if (!toilet) {
            console.log('Toilet not found:', req.params.id);
            return res.status(404).json({ message: 'Toilet not found' });
        }

        console.log('Found toilet:', toilet);
        res.json(toilet);
    } catch (error) {
        console.error('Error fetching toilet:', error);
        res.status(500).json({ 
            message: 'Error fetching toilet details', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all toilets with pagination and filters
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { isActive: true };
        
        // Add filters if provided
        if (req.query.rating) {
            query.averageRating = { $gte: parseFloat(req.query.rating) };
        }

        const toilets = await Toilet.find(query)
            .select('name location averageRating totalReviews')
            .skip(skip)
            .limit(limit)
            .sort('-averageRating');

        const total = await Toilet.countDocuments(query);

        res.json({
            toilets,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalToilets: total
        });
    } catch (error) {
        console.error('Error fetching toilets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 