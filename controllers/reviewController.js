const Review = require('../models/Review');
const Toilet = require('../models/Toilet');

exports.submitReview = async (req, res) => {
    try {
        const { toiletId, rating, cleanliness, maintenance, accessibility, comment } = req.body;

        // Validate toilet exists
        const toilet = await Toilet.findById(toiletId);
        if (!toilet) {
            return res.status(404).json({ message: 'Toilet not found' });
        }

        // Create new review
        const review = new Review({
            toiletId,
            rating,
            cleanliness,
            maintenance,
            accessibility,
            comment
        });

        await review.save();

        // Update toilet ratings
        const reviews = await Review.find({ toiletId });
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

        await Toilet.findByIdAndUpdate(toiletId, {
            averageRating,
            totalReviews
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getToiletReviews = async (req, res) => {
    try {
        const { toiletId } = req.params;
        const reviews = await Review.find({ toiletId })
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get toilet reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 