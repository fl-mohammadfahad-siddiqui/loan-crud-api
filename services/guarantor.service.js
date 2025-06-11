const db = require('../config/db');

exports.getAllGuarantors = async () => {
    const [rows] = await db.query('SELECT * FROM guarantor');
    return rows;
};

exports.getGuarantorById = async (lead_id) => {
    const [rows] = await db.query('SELECT * FROM guarantor WHERE lead_id = ?', [lead_id]);
    if (rows.length === 0) throw new Error('Guarantor not found');
    return rows[0];
};

exports.createGuarantor = async (data) => {
    const { lead_id, first_name, last_name, mobile, pan_card } = data;
    const sql = 'INSERT INTO guarantor (lead_id, first_name, last_name, mobile, pan_card) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [lead_id, first_name, last_name, mobile, pan_card]);
    return { message: 'Guarantor created', lead_id };
};

exports.updateGuarantor = async (lead_id, data) => {
    const allowedFields = ['first_name', 'last_name', 'mobile', 'pan_card'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(data[field]);
        }
    }

    if (updates.length === 0) throw new Error('No valid fields to update');

    const sql = `UPDATE guarantor SET ${updates.join(', ')} WHERE lead_id = ?`;
    values.push(lead_id);

    const [result] = await db.query(sql, values);
    return { message: 'Guarantor updated', affectedRows: result.affectedRows };
};

exports.deleteGuarantor = async (lead_id) => {
    const [result] = await db.query('DELETE FROM guarantor WHERE lead_id = ?', [lead_id]);
    return { message: 'Guarantor deleted', affectedRows: result.affectedRows };
};
