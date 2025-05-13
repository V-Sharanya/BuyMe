const db = require('../db');

// Function to create the bids table
async function createBidTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS bids (
      bid_id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      user_id INT NOT NULL,
      bid_amount DECIMAL(10,2) NOT NULL,
      bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(auction_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `;
  await db.query(sql);
}

// Function to insert a new bid
async function placeBid(auctionId, userId, bidAmount) {
  const sql = `
    INSERT INTO bids (auction_id, user_id, bid_amount)
    VALUES (?, ?, ?)
  `;
  await db.query(sql, [auctionId, userId, bidAmount]);
}

// Function to get bids by auction ID
async function getBidsByAuction(auctionId) {
  const sql = `
    SELECT b.*, u.username
    FROM bids b
    JOIN users u ON b.user_id = u.user_id
    WHERE b.auction_id = ?
    ORDER BY b.bid_amount DESC, b.bid_time ASC
  `;
  const [rows] = await db.query(sql, [auctionId]);
  return rows;
}

// Function to get all bids
async function getAllBids() {
  const sql = `
    SELECT * FROM bids
  `;
  const [rows] = await db.query(sql);
  return rows;
}

module.exports = {
  createBidTable,
  placeBid,
  getBidsByAuction,
  getAllBids
};
