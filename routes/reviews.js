const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Toilet = require('../models/Toilet');

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { toiletId, rating, comment, cleanliness, maintenance, accessibility } = req.body;

    // Create review
    const review = new Review({
      toiletId,
      rating,
      comment,
      cleanliness,
      maintenance,
      accessibility
    });

    await review.save();

    // Update toilet's average rating and total reviews
    const toilet = await Toilet.findById(toiletId);
    if (!toilet) {
      return res.status(404).json({ message: 'Toilet not found' });
    }

    const reviews = await Review.find({ toiletId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    
    toilet.averageRating = totalRating / reviews.length;
    toilet.totalReviews = reviews.length;
    await toilet.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a specific toilet
router.get('/toilet/:toiletId', async (req, res) => {
  try {
    const reviews = await Review.find({ toiletId: req.params.toiletId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews (protected route)
router.get('/', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 