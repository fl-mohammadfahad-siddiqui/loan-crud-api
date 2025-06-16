const db = require('../config/db');

exports.uploadDocument = async (file, loan_id) => {
  const { filename: name, mimetype: type, size, path } = file;

  const [result] = await db.query(
    'INSERT INTO documents (loan_id, name, type, size, path) VALUES (?, ?, ?, ?, ?)',
    [loan_id, name, type, size, path]
  );

  return { message: 'Document uploaded successfully', document_id: result.insertId };
};

exports.getDocumentsByLoanId = async (loan_id) => {
  const [documents] = await db.query(
    'SELECT * FROM documents WHERE loan_id = ?',
    [loan_id]
  );
  return documents;
};
