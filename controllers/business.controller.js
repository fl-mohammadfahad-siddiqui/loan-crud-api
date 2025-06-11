const businessService = require('../services/business.service');

exports.getAllBusiness = async (req, res, next) => {
    try {
        const result = await businessService.getAllBusiness();
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getBusinessById = async (req, res, next) => {
    try {
        const result = await businessService.getBusinessById(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};


exports.createBusiness = async (req, res, next) => {
    try {
        const result = await businessService.createBusiness(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.updateBusiness = async (req, res, next) => {
    try {
        const result = await businessService.updateBusiness(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.deleteBusiness = async (req, res, next) => {
    try {
        const result = await businessService.deleteBusiness(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
