const express = require('express');
const router = express.Router();
const { submitQuery, getAllQueries, getRepQueries, updateQuery } = require('../models/queryModel');

// Submit a new query
router.post('/submit', async (req, res) => {
    try {
        const { email, query_text, user_id = null } = req.body;

        if (!email || !query_text) {
            return res.status(400).json({ success: false, message: 'Email and query text are required' });
        }

        const result = await submitQuery({ user_id, email, query_text });
        res.json({ success: true, message: 'Query submitted successfully', query_id: result.insertId });
    } catch (err) {
        console.error('Error submitting query:', err);
        res.status(500).json({ success: false, message: 'Failed to submit query' });
    }
});

// Get all queries
router.get('/all', async (req, res) => {
    try {
        const queries = await getAllQueries();
        res.json({ success: true, queries });
    } catch (err) {
        console.error('Error fetching queries:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch queries' });
    }
});

// Get queries for a specific representative
router.get('/rep', async (req, res) => {
    try {
        const { rep_id } = req.query;  // expect rep_id to be passed via query param
        if (!rep_id) {
            return res.status(400).json({ success: false, message: 'Representative ID required' });
        }

        const queries = await getRepQueries(rep_id);
        res.json({ success: true, queries });
    } catch (err) {
        console.error('Error fetching representative queries:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch queries' });
    }
});

// Update query status and response
router.put('/:queryId', async (req, res) => {
    try {
        const { queryId } = req.params;
        let { status, response, rep_id } = req.body;

        rep_id = rep_id || 1;

        if (!status || !response || !rep_id) {
            return res.status(400).json({ success: false, message: 'Status, response, and representative ID are required' });
        }

        await updateQuery(queryId, { status, response, rep_id });
        res.json({ success: true, message: 'Query updated successfully' });
    } catch (err) {
        console.error('Error updating query:', err);
        res.status(500).json({ success: false, message: 'Failed to update query' });
    }
});

module.exports = router;
