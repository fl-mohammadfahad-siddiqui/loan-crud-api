const db = require('../../config/db');

const getLeadById = async (lead_id) => {
  const [rows] = await db.query('SELECT * FROM leads WHERE lead_id = ?', [lead_id]);
  return rows[0] || null;
};

module.exports = { getLeadById };
