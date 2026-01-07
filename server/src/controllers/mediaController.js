const Media = require('../models/Media');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description } = req.body;

    const media = await Media.create({
      title: title || req.file.originalname,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: 'pdf',
      uploadedBy: req.user._id
    });

    res.status(201).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.find()
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Only admin can delete media
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await media.deleteOne();
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
