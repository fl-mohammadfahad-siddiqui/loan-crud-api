const express = require('express');
const router = express.Router();
const {getAllLeads,
    createLead,
    updateLead,
    deleteLead
} = require("../controllers/leads.controller");
const leadsController = require('../controllers/leads.controller');
const { getLeadById } = require('../services/leads.service');
router.post('/', leadsController.createLead);
router.get('/:id', leadsController.getLeadById);

// router.route("/").get(getAllLeads);

// router.route("/:id").get(getLeadById);

// router.route("/").post(createLead);

// router.route("/:id").put(updateLead);

// router.route("/:id").delete(deleteLead);
module.exports = router;