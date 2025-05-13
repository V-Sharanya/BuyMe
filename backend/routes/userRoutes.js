const express = require('express'); 
const router = express.Router(); 
const db = require('../db'); 
const bcrypt = require('bcrypt'); 
const {
  getAllUsers,
  deleteUser
} = require('../models/userModel');
 
router.post('/signup', async (req, res) => { 
  const { username, email, password, confirm_password, role } = req.body; 

  if (password !== confirm_password) { 
    return res.status(400).json({ success: false, message: 'Passwords do not match' }); 
  } 
 
  try { 
    // Check if email already exists in the database 
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]); 
    if (existingUser.length > 0) { 
      return res.status(400).json({ success: false, message: 'Email already in use' }); 
    } 
 
    // Hash the password 
    const hashedPassword = await bcrypt.hash(password, 10); 
 
    // Insert the new user into the database 
    await db.query( 
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
      [username, email, hashedPassword, role] 
    ); 
 
    res.status(201).json({ success: true, message: 'User registered successfully!' });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ success: false, message: 'Error registering user' }); 
  } 
}); 


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Raw user data from database:', users[0]); // Debug log

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    console.log('User object before sending:', user); // Debug log
    let isPasswordMatch = false;
    // Compare hashed passwords
    // Check if stored password looks like bcrypt hash
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Direct string comparison for plain passwords
      isPasswordMatch = password === user.password;
    }

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Set session
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Create response object
    const userResponse = {
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('Response being sent:', userResponse); // Debug log
    res.status(200).json(userResponse);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

router.post('/:user_id/reset-password', async (req, res) => {
  const { user_id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Fetch the user
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = users[0];

    // 2. Compare current password with hashed password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // 3. Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedNewPassword, user_id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
// Delete Account
router.delete('/delete-account', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Delete user from database
    await db.query('DELETE FROM users WHERE email = ?', [email]);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, message: 'Server error during account deletion' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    console.log('Fetched users:', users);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Failed to fetch users');
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully', result: deleted });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Failed to delete user');
  }
});

module.exports = router;
