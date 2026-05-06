const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { logAction } = require('../utils/logger');
const bcrypt = require('bcryptjs');

/**
 * GET ALL ACTIVITY LOGS
 * Only accessible by Super Admin
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL ADMINS
 * Only accessible by Super Admin
 */
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE NEW ADMIN
 */
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newAdmin = new User({ name, email, password, role: 'admin', permissions: permissions || [] });
    await newAdmin.save();
    await logAction(req, 'CREATE_ADMIN', 'USER', newAdmin._id, { name: newAdmin.name, email: newAdmin.email, assignedPermissions: newAdmin.permissions });
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;
    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE ADMIN PERMISSIONS
 */
exports.updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;
    const targetAdmin = await User.findById(id);
    if (!targetAdmin) return res.status(404).json({ message: 'Admin not found' });
    const oldPermissions = targetAdmin.permissions;
    const oldRole = targetAdmin.role;
    if (permissions !== undefined) targetAdmin.permissions = permissions;
    if (role !== undefined) targetAdmin.role = role;
    await targetAdmin.save();
    await logAction(req, 'UPDATE_ADMIN_ACCESS', 'USER', targetAdmin._id, { previousRole: oldRole, newRole: targetAdmin.role, previousPermissions: oldPermissions, newPermissions: targetAdmin.permissions });
    res.json({ message: 'Admin permissions updated successfully', user: { id: targetAdmin._id, name: targetAdmin.name, role: targetAdmin.role, permissions: targetAdmin.permissions } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE ADMIN
 */
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'Admin not found' });
    if (target.role === 'superadmin') return res.status(403).json({ message: 'Cannot delete a Super Admin' });
    await target.deleteOne();
    await logAction(req, 'DELETE_ADMIN', 'USER', id, { name: target.name, email: target.email });
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ANALYTICS
 * Comprehensive dashboard data: revenue trends, top products, order breakdowns, user growth
 */
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(now); todayEnd.setHours(23,59,59,999);
    const last30Start = new Date(now); last30Start.setDate(now.getDate() - 29); last30Start.setHours(0,0,0,0);
    const last7Start  = new Date(now); last7Start.setDate(now.getDate() - 6);  last7Start.setHours(0,0,0,0);

    // ── 1. KPI CARDS ────────────────────────────────────────────────────────
    const [
      todayOrders,
      allOrders,
      totalProducts,
      totalUsers,
    ] = await Promise.all([
      Order.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.find(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
    ]);

    const activeOrders       = allOrders.filter(o => !['CANCELLED','FAILED'].includes(o.paymentStatus));
    const todayActiveOrders  = todayOrders.filter(o => !['CANCELLED','FAILED'].includes(o.paymentStatus));
    const todayRevenue       = todayActiveOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const totalRevenue       = activeOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const avgOrderValue      = activeOrders.length ? totalRevenue / activeOrders.length : 0;
    const pendingOrders      = activeOrders.filter(o => !o.isDelivered).length;

    // ── 2. REVENUE TREND — last 30 days ─────────────────────────────────────
    const revenueTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0,0,0,0);
      const dEnd = new Date(d); dEnd.setHours(23,59,59,999);
      const dayOrders = allOrders.filter(o => {
        const c = new Date(o.createdAt);
        return c >= d && c <= dEnd && !['CANCELLED','FAILED'].includes(o.paymentStatus);
      });
      revenueTrend.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: Math.round(dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0)),
        orders: dayOrders.length,
      });
    }

    // ── 3. ORDERS BY STATUS ─────────────────────────────────────────────────
    const statusBreakdown = [
      { name: 'Delivered',    value: allOrders.filter(o => o.isDelivered).length,                                                     color: '#10b981' },
      { name: 'Paid',         value: allOrders.filter(o => o.isPaid && !o.isDelivered).length,                                        color: '#3b82f6' },
      { name: 'COD Confirmed',value: allOrders.filter(o => o.paymentStatus === 'COD_CONFIRMED' && !o.isDelivered).length,             color: '#f59e0b' },
      { name: 'Pending',      value: allOrders.filter(o => !o.isPaid && !o.isDelivered && !['CANCELLED','FAILED','COD_CONFIRMED'].includes(o.paymentStatus)).length, color: '#a78bfa' },
      { name: 'Cancelled',    value: allOrders.filter(o => o.paymentStatus === 'CANCELLED').length,                                    color: '#ef4444' },
    ].filter(s => s.value > 0);

    // ── 4. PAYMENT METHOD SPLIT ─────────────────────────────────────────────
    const paymentSplit = [
      { name: 'Cash on Delivery', value: activeOrders.filter(o => o.paymentMethod === 'COD').length,    color: '#e8621a' },
      { name: 'Online (Razorpay)', value: activeOrders.filter(o => o.paymentMethod === 'Online').length, color: '#6366f1' },
    ].filter(p => p.value > 0);

    // ── 5. TOP PRODUCTS (by quantity sold) ──────────────────────────────────
    const productSales = {};
    activeOrders.forEach(o => {
      (o.orderItems || []).forEach(item => {
        const key = item.name || 'Unknown';
        if (!productSales[key]) productSales[key] = { name: key, qty: 0, revenue: 0 };
        productSales[key].qty     += item.quantity || 0;
        productSales[key].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map(p => ({ ...p, revenue: Math.round(p.revenue) }));

    // ── 6. WEEKLY ORDERS (last 7 days) ──────────────────────────────────────
    const weeklyOrders = [];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0,0,0,0);
      const dEnd = new Date(d); dEnd.setHours(23,59,59,999);
      const dayOrders = allOrders.filter(o => {
        const c = new Date(o.createdAt); return c >= d && c <= dEnd;
      });
      weeklyOrders.push({
        day: days[d.getDay()],
        orders: dayOrders.length,
        revenue: Math.round(dayOrders.filter(o => !['CANCELLED','FAILED'].includes(o.paymentStatus)).reduce((s,o) => s+(o.totalPrice||0), 0)),
      });
    }

    // ── 7. RECENT ORDERS (last 5) ───────────────────────────────────────────
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    // ── 8. LOW STOCK PRODUCTS ───────────────────────────────────────────────
    const lowStock = await Product.find({ stock: { $lte: 10 }, isActive: { $ne: false } })
      .select('name stock price image')
      .sort({ stock: 1 })
      .limit(6)
      .lean();

    res.json({
      kpi: { todayRevenue, totalRevenue, avgOrderValue, totalOrders: allOrders.length, activeOrders: activeOrders.length, pendingOrders, totalProducts, totalUsers, todayOrders: todayActiveOrders.length },
      revenueTrend,
      statusBreakdown,
      paymentSplit,
      topProducts,
      weeklyOrders,
      recentOrders,
      lowStock,
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
