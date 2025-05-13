const db = require('../db');
const { createUserTable } = require('./userModel');

// Function to create the queries table
async function createQueryTable() {
    try {
        // First ensure the users table exists
        await createUserTable();
        
        const sql = `
            CREATE TABLE IF NOT EXISTS queries (
                query_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                email VARCHAR(100) NOT NULL,
                query_text TEXT NOT NULL,
                status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME,
                response TEXT,
                rep_id INT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (rep_id) REFERENCES users(user_id)
            )
        `;
        await db.query(sql);
        console.log("✅ queries table created or already exists.");
    } catch (error) {
        console.error("Error creating queries table:", error);
        throw error;
    }
}

// Function to submit a new query
async function submitQuery(queryData) {
    try {
        const { user_id, email, query_text } = queryData;
        const sql = `
            INSERT INTO queries (user_id, email, query_text)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.query(sql, [user_id || null, email, query_text]);
        return result;
    } catch (error) {
        console.error("Error submitting query:", error);
        throw error;
    }
}

// Function to get all queries
async function getAllQueries() {
    const sql = `
        SELECT 
            q.*,
            u.username as user_name,
            r.username as rep_name
        FROM queries q
        LEFT JOIN users u ON q.user_id = u.user_id
        LEFT JOIN users r ON q.rep_id = r.user_id
        ORDER BY q.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
}

// Function to get queries for a specific customer representative
async function getRepQueries(repId) {
    const sql = `
        SELECT 
            q.*,
            u.username as user_name
        FROM queries q
        LEFT JOIN users u ON q.user_id = u.user_id
        WHERE q.rep_id = ? OR q.status = 'pending'
        ORDER BY q.created_at DESC
    `;
    const [rows] = await db.query(sql, [repId]);
    return rows;
}

// Function to update query status and response
async function updateQuery(queryId, updateData) {
    const { status, response, rep_id } = updateData;
    const sql = `
        UPDATE queries 
        SET status = ?,
            response = ?,
            rep_id = ?,
            resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE query_id = ?
    `;
    const [result] = await db.query(sql, [status, response, rep_id, status, queryId]);
    return result;
}

module.exports = {
    createQueryTable,
    submitQuery,
    getAllQueries,
    getRepQueries,
    updateQuery
}; 