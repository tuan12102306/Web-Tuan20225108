const db = require('../config/db.config');

exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Insert new user
        await db.execute(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, password, email, 'user']
        );

        res.json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getBorrowHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [history] = await db.execute(`
            SELECT 
                br.id as borrowId,
                b.title as bookTitle,
                b.author,
                br.borrowDate,
                br.returnDate,
                br.status
            FROM borrows br
            JOIN books b ON br.bookId = b.id
            WHERE br.userId = ?
            ORDER BY br.borrowDate DESC
        `, [userId]);

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error('Get borrow history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, email } = req.body;

        // Validate input
        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        // Update user info
        await db.execute(
            'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
            [fullName, email, userId]
        );

        // Get updated user info
        const [users] = await db.execute(
            'SELECT id, username, fullName, email, role FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        console.log('Change password request for user:', userId); // Debug log

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get current user with password
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        console.log('Found user:', users[0]?.id); // Debug log

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Debug log cho mật khẩu hiện tại
        console.log('Verifying password for user:', users[0].username);
        
        // Verify current password
        const validPassword = await bcrypt.compare(
            currentPassword,
            users[0].password
        );
        console.log('Password valid:', validPassword); // Debug log

        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, fullName, email, role, phone, address, createdAt FROM users'
    );
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, fullName, email, role, phone, address, createdAt FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, address } = req.body;
    const userId = req.params.id;

    // Verify user has permission
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const [result] = await db.execute(
      'UPDATE users SET fullName = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [fullName, email, phone, address, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getAllReaders = async (req, res) => {
    try {
        console.log('Getting all readers...'); // Debug log

        const [readers] = await db.execute(
            'SELECT id, username, fullName, email, role FROM users WHERE role = "user"'
        );
        console.log('Found readers:', readers); // Debug log

        return res.json({
            success: true,
            data: readers
        });
    } catch (error) {
        console.error('Error getting readers:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getReaderBorrows = async (req, res) => {
    try {
        const [borrows] = await db.execute(
            `SELECT b.*, books.title as bookTitle 
             FROM borrows b 
             JOIN books ON b.bookId = books.id 
             WHERE b.userId = ?`,
            [req.params.id]
        );
        
        res.json({
            success: true,
            data: borrows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};