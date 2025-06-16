const documentsService = require('../services/documents.service');

exports.uploadDocument = async (req, res) => {
  try {
    const loan_id = req.body.loan_id;
    const file = req.file;
    if (!file || !loan_id) return res.status(400).json({ error: 'loan_id and file required' });

    const result = await documentsService.uploadDocument(file, loan_id);
    res.status(201).json(result);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

exports.getDocumentsByLoan = async (req, res) => {
  try {
    const loan_id = req.params.loan_id;
    const documents = await documentsService.getDocumentsByLoanId(loan_id);

    if (!documents.length) {
      return res.status(404).json({ error: 'No documents found for this loan_id' });
    }

    // Add full view URL to each document
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const docsWithLinks = documents.map(doc => ({
      ...doc,
      view_url: `${baseUrl}/documents/view/${doc.name}`
    }));

    res.status(200).json(docsWithLinks);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.viewAllDocumentsByLoan = async (req, res) => {
  try {
    const loan_id = req.params.loan_id;
    const documents = await documentsService.getDocumentsByLoanId(loan_id);

    if (!documents.length) {
      return res.status(404).json({ error: 'No documents found for this loan_id' });
    }

    // Add full view URL to each document
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const docsWithLinks = documents.map(doc => ({
      ...doc,
      view_url: `${baseUrl}/documents/view/${doc.name}`
    }));

    res.status(200).json(docsWithLinks);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
