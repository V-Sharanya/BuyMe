const db = require('../db');

// Function to create the items table
async function createItemsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            brand VARCHAR(100),
            size VARCHAR(50),
            color VARCHAR(50),
            material VARCHAR(100),
            gender VARCHAR(20),
            seller_id INT,
            image VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(user_id)
        )
    `;
    try {
        await db.query(sql);
        console.log("✅ items table created or already exists.");
    } catch (error) {
        console.error("Error creating items table:", error);
        throw error;
    }
}

// ADD a new item
async function addItem(data) {
  const {
    name, description, brand, size, color,
    material, gender, seller_id, image
  } = data;

  const sql = `
    INSERT INTO items (
      name, description, brand, size, color, material, gender, seller_id, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    name, description, brand, size, color,
    material, gender, seller_id, image
  ]);

  return result;
}

// VIEW all items
async function getAllItems() {
  const [rows] = await db.query('SELECT * FROM items');
  return rows;
}



// VIEW item by ID
async function getItemById(id) {
  const sql = `
    SELECT 
      i.*,
      GROUP_CONCAT(a.auction_id) as auction_ids
    FROM items i
    LEFT JOIN auctions a ON i.item_id = a.item_id
    WHERE i.item_id = ?
    GROUP BY i.item_id
  `;
  const [rows] = await db.query(sql, [id]);
  if (rows[0]) {
    // Convert the comma-separated auction_ids string to an array
    rows[0].auction_ids = rows[0].auction_ids ? rows[0].auction_ids.split(',').map(id => parseInt(id)) : [];
  }
  return rows[0];
}

// EDIT item by ID
async function updateItem(id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  values.push(id);

  const sql = `UPDATE items SET ${fields.join(', ')} WHERE item_id = ?`;
  const [result] = await db.query(sql, values);
  return result;
}

// DELETE item by ID
async function deleteItem(id) {
  const [result] = await db.query('DELETE FROM items WHERE item_id = ?', [id]);
  return result;
}

module.exports = {
  createItemsTable,
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
};
