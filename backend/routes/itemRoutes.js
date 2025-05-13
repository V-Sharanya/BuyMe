const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
} = require('../models/itemModel');

// Ensure 'uploads/' folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


// POST: Add new item
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    data.image = req.file ? '/uploads/' + req.file.filename : null;

    const result = await addItem(data);
    res.json({ message: 'Shoe item with image added successfully!', item: result });
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).send('Failed to add item');
  }
});


// GET: View all items
router.get('/', async (req, res) => {
  try {
    const items = await getAllItems();
    console.log('Fetched items:', items);
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Failed to fetch items');
  }
});




// GET: Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    res.json(item);
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).send('Failed to fetch item');
  }
});


// PUT: Update an item
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }

    const updated = await updateItem(req.params.id, data);
    res.json({ message: 'Item updated successfully', item: updated });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).send('Failed to update item');
  }
});


// DELETE: Delete an item
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await deleteItem(req.params.id);
    res.json({ message: 'Item deleted successfully', result: deleted });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Failed to delete item');
  }
});

module.exports = router;
