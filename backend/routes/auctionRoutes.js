const express = require('express');
const router = express.Router();
const { createAuction, placeBid, getActiveAuctions, getAllAuctions, getCompletedAuctions } = require('../models/auctionModel');  
const { getAuctionWinner } = require('../models/auctionModel');
const db = require('../db');

const { getAuctionWithItemDetails } = require('../models/auctionModel');

// Add this route:
router.get('/:auction_id/details', async (req, res) => {
  try {
    const { auction_id } = req.params;
    const auction = await getAuctionWithItemDetails(auction_id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }
    res.json({ success: true, auction });
  } catch (err) {
    console.error('Error fetching auction details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch auction details' });
  }
});

router.get('/active', async (req, res) => {
  try {
      const activeAuctions = await getActiveAuctions();
      res.json({
          success: true,
          auctions: activeAuctions
      });
  } catch (err) {
      console.error("Error fetching active auctions:", err);
      res.status(500).json({
          success: false,
          message: "Failed to fetch active auctions"
      });
  }
});


router.post('/create', async (req, res) => {
  try {
    const { item_id, start_time, end_time, starting_price, min_price, bid_increment } = req.body;

    if (!item_id || !start_time || !end_time || !starting_price || !min_price || !bid_increment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields."
      });
    }

    await createAuction(req.body);

    res.status(201).json({
      success: true,
      message: "Auction created successfully!"
    });
  } catch (err) {
    console.error("Error creating auction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create auction"
    });
  }
});

router.post('/:auction_id/bid', async (req, res) => {
  try {
    const { auction_id } = req.params;
    const { user_id, bid_amount } = req.body;

    if (!user_id || !bid_amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields."
      });
    }

    const result = await placeBid(auction_id, user_id, bid_amount);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error placing bid:", err);
    res.status(500).json({
      success: false,
      message: "Failed to place bid"
    });
  }
});

// Endpoint to get all auctions (active and completed)
router.get('/all', async (req, res) => {
  try {
    const allAuctions = await getAllAuctions();
    res.json({
      success: true,
      auctions: allAuctions
    });
  } catch (err) {
    console.error("Error fetching all auctions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all auctions"
    });
  }
});

router.get('/:auction_id/winner', async (req, res) => {
  try {
    const { auction_id } = req.params;
    const result = await getAuctionWinner(auction_id);
    res.json(result);
  } catch (err) {
    console.error("Error fetching auction winner:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch auction winner"
    });
  }
});

// Endpoint to get completed auctions
router.get('/completed', async (req, res) => {
  try {
    const completedAuctions = await getCompletedAuctions();
    res.json({
      success: true,
      auctions: completedAuctions
    });
  } catch (err) {
    console.error("Error fetching completed auctions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed auctions"
    });
  }
});

// Endpoint to stop an auction
router.post('/:auction_id/stop', async (req, res) => {
  try {
    const { auction_id } = req.params;
    const sql = `
      UPDATE auctions 
      SET status = 'closed', end_time = NOW() 
      WHERE auction_id = ? AND status = 'active'
    `;
    await db.query(sql, [auction_id]);
    res.json({
      success: true,
      message: 'Auction stopped successfully'
    });
  } catch (err) {
    console.error("Error stopping auction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to stop auction"
    });
  }
});

// Endpoint to get bid reports
router.get('/reports/bids', async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.bid_id,
                b.auction_id,
                b.user_id,
                b.bid_amount,
                b.bid_time,
                u.username,
                a.item_name,
                a.starting_price,
                a.current_bid,
                a.end_time,
                a.status
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            JOIN auctions a ON b.auction_id = a.auction_id
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
