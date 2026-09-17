const db = require('../db');
const { v4: uuidv4 } = require('uuid');
//who are u
function authenticateUser(req, _res, next) {
  const authHeader = req.headers['authorization'];
  const userIdHeader = req.headers['x-user-id'];
  const userRoleHeader = req.headers['x-user-role'];

  let userId = 'user_demo';
  let role = 'student';

  if (authHeader && authHeader.startsWith('Bearer token_')) {
    userId = authHeader.replace('Bearer token_', '').trim();
  } else if (userIdHeader) {
    userId = userIdHeader;
  }

  if (userRoleHeader === 'admin' || userId === 'user_admin') {
    role = 'admin';
  }

  const user = db.findOne('users', (u) => u.id === userId) || {
    id: userId,
    name: role === 'admin' ? 'Dr. Elena Vance' : 'Alex Chen',
    email: role === 'admin' ? 'elena@learning.ai' : 'alex@learning.ai',
    role: role
  };

  req.user = user;
  next();
}
// Are you allowed in this room?
function requireProjectAccess(req, res, next) {
  const projectId = req.params.projectId || req.params.id || req.body?.projectId || req.query?.projectId;
  if (!projectId) return next();

  const user = req.user || { id: 'user_demo', role: 'student' };
  if (user.role === 'admin') return next();

  const project = db.findOne('projects', (p) => p.id === projectId);
  if (!project) return next(); // Handled by 404 downstream

  // Strict Project Isolation: user owns project OR project is the shared demo starter project
  const isOwner = project.user_id === user.id || project.id === 'project_transformers';
  if (!isOwner) {
    // Log security violation
    try {
      db.insert('security_logs', {
        id: uuidv4(),
        event_type: 'unauthorized_project_access',
        user_id: user.id,
        project_id: projectId,
        severity: 'critical',
        payload: {
          attemptedProjectId: projectId,
          userAttempting: user.id,
          projectOwner: project.user_id,
          method: req.method,
          path: req.originalUrl
        },
        action_taken: 'http_403_blocked',
        created_at: new Date().toISOString()
      });
    } catch (e) { }

    return res.status(403).json({
      error: 'Access denied: You do not have authorization to view or mutate this Project (Cross-Tenant Isolation Enforced)',
      code: 'PROJECT_ACCESS_DENIED',
      attemptedProjectId: projectId
    });
  }

  next();
}

function requireSpaceAccess(req, res, next) {
  const spaceId = req.params.spaceId || req.params.id || req.body?.spaceId;
  if (!spaceId) return next();

  const user = req.user || { id: 'user_demo', role: 'student' };
  if (user.role === 'admin') return next();

  const space = db.findOne('spaces', (s) => s.id === spaceId);
  if (!space) return next();

  if (space.user_id !== user.id && space.id !== 'space_ai_foundations') {
    return res.status(403).json({
      error: 'Access denied: You do not have authorization to access this Space',
      code: 'SPACE_ACCESS_DENIED'
    });
  }

  next();
}

module.exports = {
  authenticateUser,
  requireProjectAccess,
  requireSpaceAccess
};
