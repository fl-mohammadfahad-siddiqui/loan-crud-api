const db = require('../config/db');
const businessService = require('./business.service');
const loanService = require('./loans.service');
const guarantorService = require('./guarantor.service');
const documentService = require('./documents.service');

const createFullLead = async (data,files) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { first_name, last_name, mobile, pan_card, amount, type, business, loan, guarantor } = data;

    // 1. Insert into leads
    const [leadResult] = await connection.query(
      'INSERT INTO leads (first_name, last_name, mobile, pan_card, amount, type) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, mobile, pan_card, amount, type]
    );
    const lead_id = leadResult.insertId;

    let guarantor_id = null;

    // 2. Insert guarantor
    if (type === 'guarantor') {
      const result = await guarantorService.createGuarantor({ lead_id, first_name, last_name, mobile, pan_card }, connection);
      guarantor_id = result.guarantor_id;
    } else if (guarantor) {
      const result = await guarantorService.createGuarantor({ lead_id, ...guarantor }, connection);
      guarantor_id = result.guarantor_id;
    }

    // 3. Insert business
    let business_id = null;
    if (business) {
      const result = await businessService.createBusiness({ lead_id, ...business }, connection);
      business_id = result.business_id;
    }

    // 4. Insert loan
    let loan_id = null;
    if (loan && business_id !== null) {
      const result = await loanService.createLoan({ lead_id, business_id, guarantor_id, ...loan }, connection);
      loan_id = result.loan_id;
    }

    //5. Upload Documents
    if(files.length>0 && loan_id !== null){
      for(const file of files){
        await documentService.uploadDocument(file,loan_id,connection);
      }
    }

    await connection.commit();
    return { message: 'Lead and related data inserted successfully', lead_id, loan_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getFullLeadById = async (lead_id) => {
  const connection = await db.getConnection();
  try {
    // Get lead
    const [leads] = await connection.query('SELECT * FROM leads WHERE lead_id = ?', [lead_id]);
    if (leads.length === 0) return null;
    const lead = leads[0];

    // Get business
    const [business] = await connection.query('SELECT * FROM business WHERE lead_id = ?', [lead_id]);

    // Get loan
    const [loan] = await connection.query('SELECT * FROM loans WHERE lead_id = ?', [lead_id]);

    // Get guarantor
    const [guarantor] = await connection.query('SELECT * FROM guarantor WHERE lead_id = ?', [lead_id]);

    return {
      ...lead,
      business: business[0] || null,
      loan: loan[0] || null,
      guarantor: guarantor[0] || null
    };

  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getLeadById = async (lead_id) =>{
    const[rows] = await db.query('SELECT * FROM leads WHERE lead_id = ?',[lead_id]);
    return rows[0] || null;
}

module.exports = {
  createFullLead,
  getFullLeadById,
  getLeadById
};
