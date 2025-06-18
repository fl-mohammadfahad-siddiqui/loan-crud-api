const { createFullLead,getFullLeadById } = require('../services/leads.service');

exports.createLead = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const files = req.files || [];
    const result = await createFullLead(data,files);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const result = await getFullLeadById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Lead not found' });
    res.json(result);
  } catch (err) {
    console.error('Error fetching lead:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};