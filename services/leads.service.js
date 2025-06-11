const db = require('../config/db');

const getAllLeads = async () => {
    const [rows] = await db.query('SELECT * FROM leads');
    return rows;
};

const getLeadById = async (lead_id) => {
    const [rows] = await db.query('SELECT * FROM leads WHERE lead_id=?',[lead_id]);
    if(rows.length === 0){
        throw new Error('Lead not found');
    }
    return rows[0];
}

const createLead = async (data) => {
    const { first_name, last_name, mobile, pan_card, amount, type } = data;
    const sql = 'INSERT INTO leads (first_name, last_name, mobile, pan_card, amount, type) VALUES (?, ?, ?, ?, ?, ?)';

    const [result] = await db.query(sql, [first_name, last_name, mobile, pan_card, amount, type]);
    const lead_id = result.insertId;

    if (type === 'guarantor') {
        const gSql = 'INSERT INTO guarantor (lead_id, first_name, last_name, mobile, pan_card) VALUES (?, ?, ?, ?, ?)';
        await db.query(gSql, [lead_id, first_name, last_name, mobile, pan_card]);
        return { message: 'Lead and Guarantor inserted', lead_id };
    }

    if (type === 'applicant') {
        const cSql = 'INSERT INTO customer (lead_id, first_name, last_name, mobile, pan_card) VALUES (?, ?, ?, ?, ?)';
        await db.query(cSql, [lead_id, first_name, last_name, mobile, pan_card]);
        return { message: 'Lead and Customer inserted', lead_id };
    }

    return { message: 'Lead inserted (no associated role)', lead_id };
};


const updateLead = async (lead_id,data) =>{
    const allowedFields = ['first_name', 'last_name', 'mobile', 'pan_card', 'amount', 'type'];
    const fields = [];
    const values = [];

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            fields.push(`${field}=?`);
            values.push(data[field]);
        }
    });

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    const sql = `UPDATE leads SET ${fields.join(', ')} WHERE lead_id=?`;
    values.push(lead_id);

    await db.query(sql, values);

    return { message: 'Lead updated' };
}

const deleteLead = async (lead_id) => {
    await db.query('DELETE FROM leads WHERE lead_id=?', [lead_id]);
    return { message: 'Lead deleted' };
};

module.exports = { getAllLeads,getLeadById,createLead,updateLead,deleteLead };