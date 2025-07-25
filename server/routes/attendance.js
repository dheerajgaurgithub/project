const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { ATTENDANCE_STATUS } = require('../constants/enums');
const { getTodayRange } = require('../utils/date');

const router = express.Router();

// GET all attendance records
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'hr') {
      const employees = await User.find({ createdBy: req.user._id });
      if (employees.length === 0) return res.json([]);
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name email role')
      .populate('markedBy', 'name email role')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// GET today's attendance
router.get('/today', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();
    let query = { date: { $gte: today, $lt: tomorrow } };

    if (req.user.role === 'hr') {
      const employees = await User.find({ createdBy: req.user._id });
      if (employees.length === 0) return res.json([]);
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name email role')
      .populate('markedBy', 'name email role');

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching today's attendance:", error.stack || error.message);
    res.status(500).json({ message: "Failed to fetch today's attendance" });
  }
});

// GET employees for marking attendance
router.get('/employees', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    let query = { role: 'employee' };

    if (req.user.role === 'hr') {
      query.createdBy = req.user._id;
    }

    const employees = await User.find(query).select('name email role');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// POST mark attendance
router.post('/', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { employeeId, status, checkInTime } = req.body;

    // Validation
    if (!employeeId || !status || !ATTENDANCE_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid input. Check employeeId and status.' });
    }

    if (status === 'present' && !checkInTime) {
      return res.status(400).json({ message: 'Check-in time required for present status.' });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: 'employee',
      ...(req.user.role === 'hr' ? { createdBy: req.user._id } : {})
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or access denied' });
    }

    const { today, tomorrow } = getTodayRange();

    const existing = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = new Attendance({
      employeeId,
      employeeName: employee.name,
      status,
      checkInTime: status === 'present' ? checkInTime : null,
      markedBy: req.user._id,
      date: today
    });

    await attendance.save();
    await attendance.populate('employeeId', 'name email role');
    await attendance.populate('markedBy', 'name email role');

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

module.exports = router;
