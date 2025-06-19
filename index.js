require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./middlewares/logger');
const documentsRoutes = require('./routes/documents.routes');
const workflowRoutes = require('./routes/workflow.routes');

const app = express();
app.use(bodyParser.json());
app.use(logger);

app.use('/api/workflow',workflowRoutes);
app.use('/leads',require("./routes/leads.routes"));
app.use('/loans',require('./routes/loans.routes'));
app.use('/business',require('./routes/business.routes'));
app.use('/guarantors', require('./routes/guarantor.routes'));
app.use('/documents', documentsRoutes);


// Simple route
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js + MySQL CRUD API!');
});

const PORT = process.env.PORT || 3000;
// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
}); 