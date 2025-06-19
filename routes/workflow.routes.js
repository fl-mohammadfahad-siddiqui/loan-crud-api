const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const upload = require('../middlewares/upload')

router.get('/', workflowController.getAllWorkflows);
router.post('/save', workflowController.saveWorkflow);
router.delete('/:name', workflowController.deleteWorkflow);
router.post('/run', upload.array('documents'), workflowController.runWorkflow);

module.exports = router;
