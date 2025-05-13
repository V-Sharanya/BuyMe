const express = require('express');
const router = express.Router();
const bidModel = require('../models/bidModel');
const db = require('../db'); 

// Route to place a new bid
router.post('/', async (req, res) => {
  try {
    const { auction_id, user_id, bid_amount } = req.body;
    if (!auction_id || !user_id || !bid_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await bidModel.placeBid(auction_id, user_id, bid_amount);
    res.status(201).json({ message: 'Bid placed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all bids
router.get('/', async (req, res) => {
  try {
    const allBids = await bidModel.getAllBids();
    res.json(allBids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/auction/:auctionId', async (req, res) => {
  try {
    const bids = await bidModel.getBidsByAuction(req.params.auctionId);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all bids for a user (with auction and item info)
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const sql = `
      SELECT 
        b.bid_id,
        b.bid_amount,
        b.bid_time,
        a.auction_id,
        a.end_time,
        a.status,
        i.name AS item_name,
        i.image AS item_image
      FROM bids b
      JOIN auctions a ON b.auction_id = a.auction_id
      JOIN items i ON a.item_id = i.item_id
      WHERE b.user_id = ?
      ORDER BY b.bid_time DESC
    `;
    const [rows] = await db.query(sql, [user_id]);
    res.json({ success: true, bids: rows });
  } catch (err) {
    console.error('Error fetching user bid history:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bid history' });
  }
});

// Endpoint to get bid reports
router.get('/reports', async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.bid_id,
                b.auction_id,
                b.user_id,
                b.bid_amount,
                b.bid_time,
                u.username,
                i.name AS item_name,
                a.starting_price,
                a.current_bid,
                a.end_time,
                CASE 
                    WHEN a.status = 'closed' THEN 'closed'
                    WHEN a.end_time <= NOW() THEN 'closed'
                    ELSE 'active'
                END as status
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            JOIN auctions a ON b.auction_id = a.auction_id
            JOIN items i ON a.item_id = i.item_id
            ORDER BY b.bid_time DESC
        `;
        
        const [bids] = await db.query(sql);
        
        res.json({
            success: true,
            bids: bids
        });
    } catch (err) {
        console.error("Error fetching bid reports:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bid reports"
        });
    }
});

module.exports = router;

