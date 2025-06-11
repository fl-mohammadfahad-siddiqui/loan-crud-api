const leadsService = require("../services/leads.service");

const getAllLeads = async (req,res) => {
    try{
        const leads = await leadsService.getAllLeads();
        res.json(leads);
    }catch(err){
        res.status(500).send(err);
    }
};

const getLeadById = async (req,res) => {
    try{
        const lead = await leadsService.getLeadById(req.params.id);
        res.json(lead);
    }catch (err){
        res.status(404).json({error: err.message});
    }
};

const createLead = async (req,res) => {
    try{
        const result = await leadsService.createLead(req.body);
        res.json(result);
    }catch(err){
        res.status(500).send(err);
    }
};

const updateLead = async (req,res) => {
    try{
        const result = await leadsService.updateLead(req.params.id,req.body);
        res.json(result);
    }catch(err){
        res.status(500).send(err);
    }
};

const deleteLead = async (req,res) => {
    try{
        const result = await leadsService.deleteLead(req.params.id);
        res.json(result);
    }catch(err){
        res.status(500).send(err);
    }
};


module.exports = { getAllLeads,getLeadById, createLead,updateLead,deleteLead }