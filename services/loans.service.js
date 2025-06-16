const db = require('../config/db');
const {getLeadById} = require('./common/getLeadById');
const businessService = require('./business.service');
const guarantorService = require('./guarantor.service');
const documentService = require('./documents.service');
const validStatuses = ['approved', 'pending', 'rejected'];

exports.getAllLoans = async () => {
    const [rows] = await db.query('SELECT * FROM loans');
    return rows;
};

exports.getLoanById = async (loan_id) => {
    const [rows] = await db.query('SELECT * FROM loans WHERE loan_id = ?', [loan_id]);
    if (rows.length === 0) throw new Error('Loan not found');
    return rows[0];
};

exports.getFullLoanById = async (loan_id, baseUrl) => {
  const connection = await db.getConnection();
  try {
    const [loanRows] = await connection.query('SELECT * FROM loans WHERE loan_id = ?', [loan_id]);
    if (loanRows.length === 0) return null;

    const loan = loanRows[0];

    const lead = await getLeadById(loan.lead_id);
    const business = await businessService.getBusinessById(loan.business_id);
    const guarantor = loan.guarantor_id ? await guarantorService.getGuarantorById(loan.guarantor_id) : null;
    let documents = await documentService.getDocumentsByLoanId(loan_id);

    documents = documents.map(doc => ({
      ...doc,
      view_url: `${baseUrl}/documents/view/${doc.name}`
    }));

    return {
      loan_id: loan.loan_id,
      status: loan.status,
      approved_amount: loan.approved_amount,
      created_at: loan.created_at,
      lead,
      business,
      guarantor,
      documents
    };
  } finally {
    connection.release();
  }
};

exports.createLoan = async (data,conn=db) => {
    const { lead_id, business_id, status, approved_amount, guarantor_id } = data;

    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be "approved", "pending", or "rejected".');
    }

    const sql = `
        INSERT INTO loans (lead_id, business_id, guarantor_id,status, approved_amount)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await conn.query(sql, [lead_id, business_id, guarantor_id, status, approved_amount]);

    return { message: 'Loan created successfully', loan_id: result.insertId };
};

exports.updateLoan = async (loan_id, data) => {
    const allowedFields = ['lead_id', 'business_id', 'status', 'approved_amount'];

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
        if (!allowedFields.includes(key)) continue;

        if (key === 'status' && !validStatuses.includes(value)) {
            throw new Error('Invalid status. Must be "approved", "pending", or "rejected".');
        }

        updates.push(`${key} = ?`);
        values.push(value);
    }

    if (updates.length === 0) {
        throw new Error('No valid fields provided for update');
    }

    const sql = `UPDATE loans SET ${updates.join(', ')} WHERE loan_id = ?`;
    values.push(loan_id);

    const [result] = await db.query(sql, values);

    return {
        message: 'Loan updated successfully',
        affectedRows: result.affectedRows,
    };
};

exports.deleteLoan = async (loan_id) => {
    const [result] = await db.query('DELETE FROM loans WHERE loan_id = ?', [loan_id]);
    return { message: 'Loan deleted successfully', affectedRows: result.affectedRows };
};
