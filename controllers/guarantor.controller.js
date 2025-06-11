const guarantorService = require('../services/guarantor.service');

exports.getAllGuarantors = async (req, res, next) => {
    try {
        const result = await guarantorService.getAllGuarantors();
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getGuarantorById = async (req, res, next) => {
    try {
        const result = await guarantorService.getGuarantorById(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.createGuarantor = async (req, res, next) => {
    try {
        const result = await guarantorService.createGuarantor(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.updateGuarantor = async (req, res, next) => {
    try {
        const result = await guarantorService.updateGuarantor(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.deleteGuarantor = async (req, res, next) => {
    try {
        const result = await guarantorService.deleteGuarantor(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
