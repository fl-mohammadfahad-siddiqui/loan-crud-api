const db = require('../config/db');

exports.uploadDocument = async (file, loan_id, conn=db) => {
  if (!loan_id || !file) throw new Error('Missing file or loan_id');
  const { filename: name, mimetype: type, size, path } = file;

  const [result] = await conn.query(
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

exports.uploadAll = async (files, loan_id, conn = db) => {
  if (!loan_id || !files || files.length === 0) {
    throw new Error('Missing loan_id or files');
  }

  for (const file of files) {
    await exports.uploadDocument(file, loan_id, conn);
  }

  return { message: 'All documents uploaded successfully' };
};

