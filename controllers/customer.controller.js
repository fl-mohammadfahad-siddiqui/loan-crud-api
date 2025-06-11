const customerService = require('../services/customer.service');

exports.getAllCustomers = async (req, res, next) => {
    try {
        const result = await customerService.getAllCustomers();
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getCustomerById = async (req, res, next) => {
    try {
        const result = await customerService.getCustomerById(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.createCustomer = async (req, res, next) => {
    try {
        const result = await customerService.createCustomer(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const result = await customerService.updateCustomer(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.deleteCustomer = async (req, res, next) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
