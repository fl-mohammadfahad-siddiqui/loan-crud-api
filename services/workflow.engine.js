const workflows = require('../config/workflows.json');
const stepHandlers = require('./stepHandlers');

exports.executeWorkflow = async (workflowName, ctx) => {
  const flow = workflows[workflowName];
  if (!flow) throw new Error(`Workflow '${workflowName}' not found`);

  for (const step of flow) {
    const fn = stepHandlers[step];
    if (fn) {
      await fn(ctx);
    } else {
      throw new Error(`No handler for step: ${step}`);
    }
  }
};
