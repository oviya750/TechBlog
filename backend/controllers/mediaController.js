const { uploadImage } = require('../services/mediaService');
const fs = require('fs');
const path = require('path');

// @desc    Upload media image
// @route   POST /api/media/upload
// @access  Private
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const result = await uploadImage(req.file.path, 'techblog/articles');

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        storageType: result.storageType,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List media files (Local + Curated library)
// @route   GET /api/media
// @access  Private
const listMedia = async (req, res, next) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    let localFiles = [];
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      localFiles = files.map(file => {
        const stats = fs.statSync(path.join(uploadDir, file));
        return {
          id: file,
          name: file,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          storage: 'local'
        };
      });
    }

    // Include curated technology photography assets for instant editorial rich insertion
    const curatedEditorialImages = [
      {
        id: 'tech-ai-chips',
        name: 'Neural Processing Architecture & Silicon',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        size: 245000,
        createdAt: new Date(),
        storage: 'curated'
      },
      {
        id: 'tech-cybersecurity-matrix',
        name: 'Zero Trust & Cryptographic Infrastructure',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        size: 312000,
        createdAt: new Date(),
        storage: 'curated'
      },
      {
        id: 'tech-cloud-datacenter',
        name: 'Distributed Cloud Datacenter & Kubernetes Clusters',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        size: 290000,
        createdAt: new Date(),
        storage: 'curated'
      },
      {
        id: 'tech-code-ide',
        name: 'Modern Full-Stack Engineering Workspace',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        size: 275000,
        createdAt: new Date(),
        storage: 'curated'
      },
      {
        id: 'tech-quantum-computing',
        name: 'Quantum Optics & Supercomputing Hardware',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
        size: 340000,
        createdAt: new Date(),
        storage: 'curated'
      }
    ];

    res.status(200).json({
      success: true,
      count: localFiles.length + curatedEditorialImages.length,
      data: [...localFiles, ...curatedEditorialImages]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadMedia, listMedia };
