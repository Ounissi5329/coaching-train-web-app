const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    const { key } = req.params;
    let settings = await Settings.findOne({ key });
    
    if (!settings) {
      // Create default settings if not found
      if (key === 'countdown_timer') {
        settings = await Settings.create({
          key: 'countdown_timer',
          value: {
            eventName: 'Spring Kickoff Event',
            targetDate: new Date('2026-02-14T10:00:00'),
            isActive: true
          }
        });
      } else {
        return res.status(404).json({ message: 'Settings not found' });
      }
    }
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    let settings = await Settings.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};