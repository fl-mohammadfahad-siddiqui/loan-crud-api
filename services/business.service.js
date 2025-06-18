const db = require('../config/db');
const { getLeadById } = require('./common/getLeadById')

exports.getAllBusiness = async () => {
    const [rows] = await db.query('SELECT * FROM business');
    const enrichedRows = await Promise.all(
        rows.map(async (business) => {
            const lead = await getLeadById(business.lead_id);
            return{
                ...business,
                lead
            };
        })
    );
    return enrichedRows;
};

exports.getBusinessById = async (business_id) => {
    const [rows] = await db.query('SELECT * FROM business WHERE business_id = ?', [business_id]);
    if (rows.length === 0) {
        throw new Error('Business not found');
    }
    const business = rows[0];
    const lead = await getLeadById(business.lead_id);
    return{ ...business,lead }
};


// exports.createBusiness = async (data) => {
//     const { lead_id, b_name, b_add, product, gst_no, mto } = data;

//     const [result] = await db.query(
//         'INSERT INTO business (lead_id, b_name, b_add, product, gst_no, mto) VALUES (?, ?, ?, ?, ?, ?)',
//         [lead_id, b_name, b_add, product, gst_no, mto]
//     );

//     return { message: 'Business created', business_id: result.insertId };
// };

exports.createBusiness = async (data, conn = db) => {
  const { lead_id, b_name, b_add, product, gst_no, mto } = data;
  const [result] = await conn.query(
    'INSERT INTO business (lead_id, b_name, b_add, product, gst_no, mto) VALUES (?, ?, ?, ?, ?, ?)',
    [lead_id, b_name, b_add, product, gst_no, mto]
  );
  return { business_id: result.insertId };
};


exports.updateBusiness = async (business_id, data) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    if (fields.length === 0) {
        throw new Error("No valid fields to update.");
    }

    const sql = `UPDATE business SET ${fields.join(', ')} WHERE business_id = ?`;
    values.push(business_id);

    const [result] = await db.query(sql, values);
    return { message: 'Business updated', affectedRows: result.affectedRows };
};


exports.deleteBusiness = async (business_id) => {
    const [result] = await db.query('DELETE FROM business WHERE business_id=?', [business_id]);
    return { message: 'Business deleted', affectedRows: result.affectedRows };
};
