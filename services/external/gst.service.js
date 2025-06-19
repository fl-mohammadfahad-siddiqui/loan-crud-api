// services/gst.service.js
const axios = require('axios');

const PAN_SEARCH_URL = 'https://dqw6uizajg.execute-api.ap-south-1.amazonaws.com/mocks/gstin/api/pan-search';
const GSTIN_DETAILS_URL = 'https://dqw6uizajg.execute-api.ap-south-1.amazonaws.com/mocks/gstin/api/search';

exports.fetchGSTData = async (pan) => {
  try {
    // Step 1: Search PAN
    const panResponse = await axios.get(`${PAN_SEARCH_URL}?pan=${pan}`);
    const gstList = panResponse.data.list;

    if (!gstList || gstList.length === 0) {
      return { success: false, error: 'No GSTIN found for this PAN', raw: panResponse.data };
    }

    // Step 2: Fetch GSTIN details
    const gstDetails = [];
    for (const gst of gstList) {
      const gstin = gst.gstin;

      try {
        const detailRes = await axios.get(`${GSTIN_DETAILS_URL}?gstin=${gstin}`);
        gstDetails.push(detailRes.data);
      } catch (err) {
        console.error(`Failed fetching details for GSTIN ${gstin}`);
      }
    }

    return {
      success: true,
      gstDetails,
      raw: { panSearch: panResponse.data, detailResults: gstDetails }
    };

  } catch (err) {
    console.error("GST Fetch Error:", err.message);
    return { success: false, error: err.message };
  }
};

exports.saveGSTReports = async (lead_id, gstResult, conn = db) => {
  if (!gstResult.success || !Array.isArray(gstResult.gstDetails)) {
    console.warn('No GST details found or gstDetails is not an array');
    return;
  }

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

    await conn.query(
      `INSERT INTO gst_reports (
        lead_id, gstin, taxpayer_name, tradename, registration_date,
        constitution, status, center, state, nature, address, raw_response
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
};
