const Toilet = require('../models/Toilet');

exports.getAllToilets = async (req, res) => {
    try {
        const toilets = await Toilet.find()
            .select('-__v')
            .sort({ name: 1 });

        res.json(toilets);
    } catch (error) {
        console.error('Get toilets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getToiletById = async (req, res) => {
    try {
        const toilet = await Toilet.findById(req.params.id)
            .select('-__v');

        if (!toilet) {
            return res.status(404).json({ message: 'Toilet not found' });
        }

        res.json(toilet);
    } catch (error) {
        console.error('Get toilet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 