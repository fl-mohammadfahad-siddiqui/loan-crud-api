const leadService = require('./leads.service');
const businessService = require('./business.service');
const cibilService = require('./external/cibil.services');
const ckycService = require('./external/ckyc.service');
const gstService = require('./external/gst.service');
const loanService = require('./loans.service');
const documentService = require('./documents.service');

module.exports = {
  lead: async (ctx) => {
    const lead = await leadService.createLead(ctx.data);
    ctx.lead = lead;
  },
  business: async (ctx) => {
    const business = await businessService.createBusiness({ lead_id: ctx.lead.lead_id, ...ctx.data.business });
    ctx.business = business;
  },
  cibil: async (ctx) => {
  const cibilData = await cibilService.checkCIBIL(ctx.lead);
  ctx.cibil = cibilData;

  if (cibilData.success) {
        await cibilService.saveCIBILReport(ctx.lead.lead_id, cibilData, ctx.connection);
    }
  },
  kyc: async (ctx) => {
    const kycData = await ckycService.searchCKYC(ctx.lead);
    ctx.ckyc = kycData;

    if (kycData.success) {
      await ckycService.saveCKYCReport(ctx.lead.lead_id, kycData, ctx.connection); // ✅ Same pattern
    }
  },
  gst: async (ctx) => {
    const gstData = await gstService.fetchGSTData(ctx.lead.pan_card);
    ctx.gst = gstData;

    if (gstData.success) {
      await gstService.saveGSTReports(ctx.lead.lead_id, ctx.gst, ctx.connection); // ✅ Same pattern
    }

  },
  loan: async (ctx) => {
    const loan = await loanService.createLoan({
      lead_id: ctx.lead.lead_id,
      business_id: ctx.business?.business_id || null,
      ...ctx.data.loan
    });
    ctx.loan = loan;
  },
  documents: async (ctx) => {
  if (!ctx.files || !ctx.loan?.loan_id) {
    throw new Error('Missing files or loan_id for document upload');
  }
  await documentService.uploadAll(ctx.files, ctx.loan.loan_id);
  }

};
