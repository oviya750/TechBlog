const Subscriber = require('../models/Subscriber');
const Contact = require('../models/Contact');

// @desc    Subscribe to Newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, topicInterests } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to the TechBlog editorial newsletter.'
      });
    }

    const subscriber = await Subscriber.create({
      email: email.toLowerCase(),
      topicInterests: topicInterests || []
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive our weekly engineering digest.',
      data: subscriber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Contact Inquiry
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields.'
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      category: category || 'General Inquiry'
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been delivered to the TechBlog editorial staff. We will reply promptly.',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contacts (Admin)
// @route   GET /api/contact
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeNewsletter,
  submitContact,
  getContacts
};

