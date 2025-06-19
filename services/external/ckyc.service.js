// services/ckyc.service.js
const axios = require('axios');
const db = require('../../config/db')

const CKYC_API_URL = 'https://dqw6uizajg.execute-api.ap-south-1.amazonaws.com/mocks/ckyc/searchAPI/api/data/SearchCKYC';

exports.searchCKYC = async (leadData) => {
  try {
    const payload = {
      pan: leadData.pan_card
    };

    const response = await axios.post(CKYC_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const result = response.data;

    if (result.error_cd === '000' && result.ckyc_data?.length > 0) {
      const ckyc = result.ckyc_data[0];

      return {
        success: true,
        kyc_no: ckyc.ckyc_reference_id,
        full_name: ckyc.full_name,
        dob: ckyc.DOB || null,
        pan: leadData.pan_card,
        image: ckyc.image || null,
        raw: result
      };
    } else {
      return {
        success: false,
        error: result.message || 'No CKYC data found',
        raw: result
      };
    }

  } catch (error) {
    console.error("CKYC Search Failed:", error.message);
    return {
      success: false,
      error: error.message,
      raw: error.response?.data || null
    };
  }
};

exports.saveCKYCReport = async (lead_id, kycData, conn = db) => {
  const { kyc_no, full_name, dob, pan, image, raw } = kycData;

  await conn.query(
    `INSERT INTO ckyc_reports (lead_id, kyc_no, full_name, dob, pan, image, raw_response)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      lead_id,
      kyc_no,
      full_name,
      dob,
      pan,
      image,
      JSON.stringify(raw)
    ]
  );
};
