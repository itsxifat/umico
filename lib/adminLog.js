import dbConnect from './db.js';
import AdminLog from './models/AdminLog.js';

/**
 * Fire-and-forget admin action logger.
 * Failures are swallowed so they never break the main operation.
 */
export async function logAction(user, action, entityType, entityId, details = null, req = null) {
  try {
    await dbConnect();
    await AdminLog.create({
      user: user._id,
      userName: user.name,
      action,
      entityType,
      entityId: String(entityId || ''),
      details,
      ipAddress: req ? (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '') : '',
    });
  } catch (err) {
    console.warn('[adminLog] failed to log:', err.message);
  }
}
