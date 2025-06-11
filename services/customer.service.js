const db = require('../config/db');

exports.getAllCustomers = async () => {
    const [rows] = await db.query('SELECT * FROM customer');
    return rows;
};

exports.getCustomerById = async (lead_id) => {
    const [rows] = await db.query('SELECT * FROM customer WHERE lead_id = ?', [lead_id]);
    if (rows.length === 0) throw new Error('Customer not found');
    return rows[0];
};

exports.createCustomer = async (data) => {
    const { lead_id, first_name, last_name, mobile, pan_card } = data;
    const sql = 'INSERT INTO customer (lead_id, first_name, last_name, mobile, pan_card) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [lead_id, first_name, last_name, mobile, pan_card]);
    return { message: 'Customer created', lead_id };
};

exports.updateCustomer = async (lead_id, data) => {
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

    const sql = `UPDATE customer SET ${updates.join(', ')} WHERE lead_id = ?`;
    values.push(lead_id);

    const [result] = await db.query(sql, values);
    return { message: 'Customer updated', affectedRows: result.affectedRows };
};

exports.deleteCustomer = async (lead_id) => {
    const [result] = await db.query('DELETE FROM customer WHERE lead_id = ?', [lead_id]);
    return { message: 'Customer deleted', affectedRows: result.affectedRows };
};
