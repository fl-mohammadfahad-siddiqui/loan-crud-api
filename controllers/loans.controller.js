const loanService = require('../services/loans.service');

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await loanService.getAllLoans();
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLoanById = async (req, res) => {
    try {
        const loan_id = req.params.id;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const loan = await loanService.getFullLoanById(loan_id, baseUrl);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        res.json(loan);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.createLoan = async (req, res) => {
    try {
        const result = await loanService.createLoan(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateLoan = async (req, res) => {
    try {
        const result = await loanService.updateLoan(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const result = await loanService.deleteLoan(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
