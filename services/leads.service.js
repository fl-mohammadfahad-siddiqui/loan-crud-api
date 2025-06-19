const db = require('../config/db');
const businessService = require('./business.service');
const loanService = require('./loans.service');
const guarantorService = require('./guarantor.service');
const documentService = require('./documents.service');
const cibilService = require('./external/cibil.services');
const ckycService = require('./external/ckyc.service');
const gstService = require('./external/gst.service');


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

    // Trigger Cibil check
    const cibilResult = await cibilService.checkCIBIL({
      first_name,last_name,mobile,pan_card
    })

    if(cibilResult.success){
      await connection.query(
        `INSERT INTO cibil_reports (lead_id, score, score_date, reason_codes, raw_response) VALUES (?, ?, ?, ?, ?)`,
        [ 
          lead_id,
          cibilResult.score,
          cibilResult.scoreDate,
          JSON.stringify(cibilResult.reasonCodes),
          JSON.stringify(cibilResult.raw)
        ]
      );
    }

    //ckyc
    const ckycResult = await ckycService.searchCKYC({ first_name, last_name, mobile, pan_card });

    if (ckycResult.success) {
      await connection.query(
        `INSERT INTO ckyc_reports (lead_id, kyc_no, full_name, dob, pan, image, raw_response) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          lead_id,
          ckycResult.kyc_no,
          ckycResult.full_name,
          ckycResult.dob ? new Date(ckycResult.dob) : null,
          ckycResult.pan,
          ckycResult.image,
          JSON.stringify(ckycResult.raw)
        ]
      );
    }

    // gst
    const gstResult = await gstService.fetchGSTData(pan_card);

    if (gstResult.success) {
      for (const gst of gstResult.gstDetails) {
        const {
          gstin,
          name,
          tradename,
          registrationDate,
          constitution,
          status,
          center,
          state,
          nature,
          pradr
        } = gst;

        await connection.query(
          `INSERT INTO gst_reports (lead_id, gstin, taxpayer_name, tradename, registration_date, constitution, status, center, state, nature, address, raw_response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lead_id,
            gstin,
            name,
            tradename,
            registrationDate ? new Date(registrationDate) : null,
            constitution,
            status,
            center,
            state,
            JSON.stringify(nature || []),
            JSON.stringify(pradr || {}),
            JSON.stringify(gst)
          ]
        );
      }
    }


    // 2. Insert guarantor
    let guarantor_id = null;
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

    // // 6. Trigger Cibil
    // try{
    //   const cibilResult = await cibilService.checkCIBIL({first_name,last_name,mobile,pan_card});
    //   await connection.query('INSERT INTO cibil_reports (lead_id, response_json) VALUES (?, ?)',[lead_id, JSON.stringify(cibilResult)]);
    // }catch(err){
    //   console.error("CIBIL API error:", err.message);
    // }

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
