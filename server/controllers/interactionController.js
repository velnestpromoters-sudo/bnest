const Access = require('../models/Access');

// Get all properties a tenant has interacted with
exports.getTenantInteractions = async (req, res) => {
  try {
    const interactions = await Access.find({ user: req.user._id, paymentStatus: 'paid' })
      .populate({
         path: 'property',
         select: 'title location images rent propertyType'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tenants who have interacted with a specific property (for Owner)
exports.getPropertyInteractions = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    
    // Can optionally verify if req.user is the owner of the property here
    
    const interactions = await Access.find({ property: propertyId, paymentStatus: 'paid' })
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single interaction
exports.getInteractionById = async (req, res) => {
  try {
    const access = await Access.findById(req.params.id)
       .populate({
          path: 'property',
          select: 'title location images rent propertyType ownerId availableContactSlots',
          populate: { path: 'ownerId', select: 'name mobile' }
       });
       
    if (!access) return res.status(404).json({ success: false, message: 'Interaction not found.' });
    
    res.status(200).json({ success: true, data: access });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update the interaction stage
exports.updateInteractionStage = async (req, res) => {
  try {
    const accessId = req.params.id;
    const { stage } = req.body;
    
    // In a real app, verify that req.user is either the tenant or the property owner
    const access = await Access.findByIdAndUpdate(
       accessId, 
       { interactionStage: stage },
       { new: true }
    );
    
    if (!access) return res.status(404).json({ success: false, message: 'Interaction not found.' });
    
    res.status(200).json({ success: true, data: access });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
