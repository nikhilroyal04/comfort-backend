const express = require('express');
const router = express.Router();
const {
  registerWithEmail,
  loginWithEmail,
  googleSignIn,
  getAllUsers,
  getUserById,
  getAllCustomers,
  getAllMembers,
  updateUser,
} = require('../services/authServices');

// Public: Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await registerWithEmail(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Public: Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginWithEmail(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Public: Login or Signup with Google ID token
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Valid Google ID token is required' });
    }

    const { token, user, isNewUser } = await googleSignIn(idToken);

    res.status(200).json({
      message: isNewUser ? 'New user registered with Google' : 'User signed in with Google',
      token,
      user,
    });
  } catch (error) {
    console.error('Google sign-in error:', error.message);
    res.status(401).json({ error: 'Google authentication failed', details: error.message });
  }
});

// Protected: Get all users (admin only)
router.get('/users', async (req, res) => {
  try {

    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers',  async (req, res) => {
  try {
    const users = await getAllCustomers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/members',  async (req, res) => {
  try {
    const users = await getAllMembers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/newUser', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await registerWithEmail(email, password, name, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Get specific user (self or admin)
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
  });

router.put('/updateUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;

    const result = await updateUser(userId, updatedUser);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
