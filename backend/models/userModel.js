const db = require('../db'); 
 
async function createUserTable() { 
  const sql = ` 
    CREATE TABLE IF NOT EXISTS users ( 
      user_id INT AUTO_INCREMENT PRIMARY KEY, 
      username VARCHAR(50) NOT NULL, 
      email VARCHAR(100) NOT NULL UNIQUE, 
      password VARCHAR(100) NOT NULL, 
      role ENUM('buyer', 'seller', 'admin', 'rep') DEFAULT 'buyer' 
    ) 
  `; 
  await db.query(sql); 
} 

async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}
 async function deleteUser(id) {
   const [result] = await db.query('DELETE FROM user WHERE user_id = ?', [id]);
   return result;
 }
 
module.exports = { createUserTable,
  getAllUsers,

  deleteUser }; 