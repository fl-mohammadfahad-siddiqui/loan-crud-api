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
        const loan = await loanService.getLoanById(req.params.id);
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
