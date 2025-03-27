const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Toilet = require('../models/Toilet');
const { authenticateToken } = require('../middleware/auth');

// Get all reviews (for admin dashboard)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching all reviews...');
        const reviews = await Review.find()
            .populate({
                path: 'toilet',
                select: 'name location'
            })
            .sort({ createdAt: -1 });

        const formattedReviews = reviews.map(review => ({
            id: review._id,
            toiletId: review.toilet?._id,
            toiletName: review.toilet ? `${review.toilet.name} (${review.toilet.location})` : 'Unknown Toilet',
            rating: review.averageRating,
            cleanliness: review.cleanliness,
            maintenance: review.maintenance,
            accessibility: review.accessibility,
            comment: review.comment,
            photos: review.photos,
            helpful: review.helpful,
            reported: review.reported,
            createdAt: review.createdAt
        }));

        console.log(`Found ${formattedReviews.length} reviews`);
        res.json(formattedReviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            message: 'Error fetching reviews', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get reviews for a specific toilet
router.get('/toilet/:toiletId', async (req, res) => {
    try {
        console.log('Fetching reviews for toilet:', req.params.toiletId);
        const reviews = await Review.find({ toilet: req.params.toiletId })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${reviews.length} reviews for toilet`);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching toilet reviews:', error);
        res.status(500).json({ message: 'Error fetching toilet reviews', error: error.message });
    }
});

// Add a new review
router.post('/add', async (req, res) => {
    try {
        const { toiletId, cleanliness, maintenance, accessibility, comment, photos } = req.body;
        console.log('Adding new review:', { toiletId, cleanliness, maintenance, accessibility, comment });

        // Validate input
        if (!toiletId || !cleanliness || !maintenance || !accessibility) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (cleanliness < 1 || cleanliness > 5 || maintenance < 1 || maintenance > 5 || accessibility < 1 || accessibility > 5) {
            return res.status(400).json({ message: 'Ratings must be between 1 and 5' });
        }

        // Create new review
        const review = new Review({
            toilet: toiletId,
            cleanliness,
            maintenance,
            accessibility,
            comment: comment || '',
            photos: photos || []
        });

        await review.save();
        console.log('Review saved successfully');

        // Update toilet's average rating and review count
        const toilet = await Toilet.findById(toiletId);
        if (toilet) {
            const allReviews = await Review.find({ toilet: toiletId });
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
            toilet.averageRating = totalRating / allReviews.length;
            toilet.totalReviews = allReviews.length;
            await toilet.save();
            console.log('Updated toilet ratings');
        }

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
});

module.exports = router; 