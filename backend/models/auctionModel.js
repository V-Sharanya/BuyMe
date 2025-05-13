const db = require('../db'); 


// Function to create a new auction
async function createAuction(auctionData) {
  const { item_id, start_time, end_time, starting_price, min_price, bid_increment } = auctionData;
  const sql = `
    INSERT INTO auctions (item_id, start_time, end_time, starting_price, min_price, bid_increment)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await db.query(sql, [item_id, start_time, end_time, starting_price, min_price, bid_increment]);
  console.log("✅ Auction created successfully.");
}

// Function to create the auctions table
async function createAuctionTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS auctions (
      auction_id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      starting_price DECIMAL(10,2) NOT NULL,
      min_price DECIMAL(10,2) NOT NULL,
      bid_increment DECIMAL(10,2) NOT NULL,
      status ENUM('active', 'closed') DEFAULT 'active',
      FOREIGN KEY (item_id) REFERENCES items(item_id)
    )
  `;
  await db.query(sql);
  console.log("✅ auctions table created or already exists.");
}

// Function to get auction details with item details
async function getAuctionWithItemDetails(auctionId) {
  const sql = `
    SELECT 
      a.*, 
      i.name as item_name, 
      i.description as item_description, 
      i.brand, 
      i.size, 
      i.color, 
      i.material, 
      i.gender, 
      i.seller_id, 
      i.image
    FROM auctions a
    JOIN items i ON a.item_id = i.item_id
    WHERE a.auction_id = ?
  `;
  try {
    const [rows] = await db.query(sql, [auctionId]);
    if (rows.length === 0) {
      throw new Error('Auction with ID ${auctionId} not found.');
    }
    return rows[0];
  } catch (error) {
    console.error('Error fetching auction details for ID ${auctionId}:', error);
    throw error;  // Re-throw error for higher-level error handling
  }
}

// Function to place a bid
async function placeBid(auctionId, userId, bidAmount) {
  const sql = `
    INSERT INTO bids (auction_id, user_id, bid_amount, bid_time)
    VALUES (?, ?, ?, NOW())
  `;
  try {
    await db.query(sql, [auctionId, userId, bidAmount]);
    return { success: true, message: "Bid placed successfully" };
  } catch (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
}

// Function to get all auctions
async function getAllAuctions() {
  const sql = `
    SELECT 
      a.*, 
      i.name as item_name,
      i.image as image_url,
      i.description as item_description,
      i.brand,
      i.size,
      i.color,
      i.material,
      i.gender
    FROM auctions a
    JOIN items i ON a.item_id = i.item_id
    ORDER BY a.end_time DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching all auctions:", error);
    throw error;
  }
}

// Function to get active auctions
async function getActiveAuctions() {
  const sql = `
    SELECT 
      a.*, 
      i.name as item_name,
      i.image as image_url,
      i.description as item_description,
      i.brand,
      i.size,
      i.color,
      i.material,
      i.gender
    FROM auctions a
    JOIN items i ON a.item_id = i.item_id
    WHERE a.status = 'active' AND a.end_time > NOW()
    ORDER BY a.end_time ASC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching active auctions:", error);
    throw error;
  }
}

// Function to get completed auctions
async function getCompletedAuctions() {
  const sql = `
    SELECT 
      a.*, 
      i.name as item_name,
      i.image as image_url,
      i.description as item_description,
      i.brand,
      i.size,
      i.color,
      i.material,
      i.gender
    FROM auctions a
    JOIN items i ON a.item_id = i.item_id
    WHERE a.status = 'closed' OR a.end_time <= NOW()
    ORDER BY a.end_time DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching completed auctions:", error);
    throw error;
  }
}

// Function to get auction winner
async function getAuctionWinner(auctionId) {
  const sql = `
    SELECT 
      b.user_id,
      u.username,
      b.bid_amount,
      b.bid_time
    FROM bids b
    JOIN users u ON b.user_id = u.user_id
    WHERE b.auction_id = ?
    ORDER BY b.bid_amount DESC, b.bid_time ASC
    LIMIT 1
  `;
  try {
    const [rows] = await db.query(sql, [auctionId]);
    if (rows.length === 0) {
      return { success: false, message: "No winner found" };
    }
    return { success: true, winner: rows[0] };
  } catch (error) {
    console.error("Error fetching auction winner:", error);
    throw error;
  }
}

module.exports = { 
  createAuction, 
  createAuctionTable, 
  getAuctionWithItemDetails,
  placeBid,
  getAllAuctions,
  getActiveAuctions,
  getCompletedAuctions,
  getAuctionWinner
};