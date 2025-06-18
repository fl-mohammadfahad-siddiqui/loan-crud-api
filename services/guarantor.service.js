const db = require('../config/db');
const { getLeadById } = require('./common/getLeadById');

exports.getAllGuarantors = async () => {
    const [rows] = await db.query('SELECT * FROM guarantor');
    const enrichedRows = await Promise.all(
        rows.map(async (guarantor) => {
            const lead = await getLeadById(guarantor.lead_id);
            return{
                ...guarantor,
                lead
            };
        })
    );
    return enrichedRows;
};

exports.getGuarantorById = async (guarantor_id,conn=db) => {
    const [rows] = await db.query('SELECT * FROM guarantor WHERE guarantor_id = ?', [guarantor_id]);
    if (rows.length === 0) throw new Error('Guarantor not found');
    const guarantor = rows[0];
    const lead = await getLeadById(guarantor.lead_id);
    return{ ...guarantor,lead };
};

exports.createGuarantor = async (data,conn=db) => {
    const { lead_id, first_name, last_name, mobile, pan_card } = data;
    const sql = 'INSERT INTO guarantor (lead_id, first_name, last_name, mobile, pan_card) VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.query(sql, [lead_id, first_name, last_name, mobile, pan_card]);
    const guarantor_id = result.insertId;
    return { message: 'Guarantor created', guarantor_id};
};

exports.updateGuarantor = async (guarantor_id, data) => {
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

    const sql = `UPDATE guarantor SET ${updates.join(', ')} WHERE guarantor_id = ?`;
    values.push(guarantor_id);

    const [result] = await db.query(sql, values);
    return { message: 'Guarantor updated', affectedRows: result.affectedRows };
};

exports.deleteGuarantor = async (guarantor_id) => {
    const [result] = await db.query('DELETE FROM guarantor WHERE guarantor_id = ?', [guarantor_id]);
    return { message: 'Guarantor deleted', affectedRows: result.affectedRows };
};
