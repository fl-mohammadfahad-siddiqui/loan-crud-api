const { executeWorkflow } = require('../services/workflow.engine');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config/workflows.json');
const db = require('../config/db');

// View all workflows
exports.getAllWorkflows = (req, res) => {
  const workflows = require(configPath);
  res.json(workflows);
};

// Add or update a workflow
exports.saveWorkflow = (req, res) => {
  const { name, steps } = req.body;
  if (!name || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'name and steps array required' });
  }

  const workflows = require(configPath);
  workflows[name] = steps;

  fs.writeFileSync(configPath, JSON.stringify(workflows, null, 2));
  res.json({ message: 'Workflow saved', workflows });
};

// Delete a workflow
exports.deleteWorkflow = (req, res) => {
  const { name } = req.params;
  const workflows = require(configPath);

  if (!workflows[name]) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  delete workflows[name];
  fs.writeFileSync(configPath, JSON.stringify(workflows, null, 2));
  res.json({ message: 'Workflow deleted', workflows });
};



exports.runWorkflow = async (req, res, next) => {
  const connection = await db.getConnection(); // create a MySQL connection

  try {
    const workflow = (req.query.workflow || 'standard_flow').trim();

    // Parse JSON from multipart/form-data field 'data'
    const rawData = req.body.data;
    let parsedData;

    try {
      parsedData = JSON.parse(rawData);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON in `data` field' });
    }

    // Prepare workflow context
    const ctx = {
      data: parsedData,
      files: req.files,
      connection
    };

    await connection.beginTransaction();

    await executeWorkflow(workflow, ctx);

    await connection.commit();

    res.status(200).json({
      message: 'Workflow executed successfully',
      lead: ctx.lead,
      loan: ctx.loan
    });

  } catch (err) {
    await connection.rollback();
    console.error('Workflow Execution Error:', err);
    res.status(500).json({ error: err.message || 'Workflow execution failed' });
  } finally {
    connection.release();
  }
};


