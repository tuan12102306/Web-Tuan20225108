const db = require('../config/db.config');

exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.execute(
      'SELECT * FROM services WHERE status = "active"'
    );
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.bookRoom = async (req, res) => {
  try {
    const { roomId, bookingDate, timeSlot } = req.body;
    const userId = req.user.id;

    // Check if room is available
    const [existingBookings] = await db.execute(
      'SELECT * FROM room_bookings WHERE roomId = ? AND bookingDate = ? AND timeSlot = ? AND status = "approved"',
      [roomId, bookingDate, timeSlot]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for this time slot'
      });
    }

    // Create booking
    await db.execute(
      'INSERT INTO room_bookings (userId, roomId, bookingDate, timeSlot) VALUES (?, ?, ?, ?)',
      [userId, roomId, bookingDate, timeSlot]
    );

    res.status(201).json({
      success: true,
      message: 'Room booked successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.requestPrint = async (req, res) => {
  try {
    const { documentName, pageCount, copies } = req.body;
    const userId = req.user.id;

    await db.execute(
      'INSERT INTO print_services (userId, documentName, pageCount, copies) VALUES (?, ?, ?, ?)',
      [userId, documentName, pageCount, copies]
    );

    res.status(201).json({
      success: true,
      message: 'Print request submitted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getUserServices = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get room bookings
    const [roomBookings] = await db.execute(
      'SELECT * FROM room_bookings WHERE userId = ? ORDER BY bookingDate DESC',
      [userId]
    );

    // Get print requests
    const [printRequests] = await db.execute(
      'SELECT * FROM print_services WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: {
        roomBookings,
        printRequests
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};