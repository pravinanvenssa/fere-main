import prisma from '../../../utils/db.js';
import cors from '../../../middleware/cors.js';
import jwt from 'jsonwebtoken';

// Manual authentication function for API routes
async function authenticateUser(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new Error('Access token required');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Get user with roles and permissions
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.userRoles.map(ur => ur.role),
    permissions: user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission)
    )
  };
}

export default async function handler(req, res) {
  // Apply CORS middleware
  cors(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // Check if user has users:read permission (needed to manage users)
    const hasPermission = user.permissions.some(p => 
      p.resource === 'users' && p.action === 'read'
    );
    
    if (!hasPermission) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format roles data
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || role.name,
      permissions: role.rolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action
      }))
    }));

    res.status(200).json(formattedRoles);
  } catch (error) {
    console.error('Get roles error:', error);
    if (error.message === 'Access token required' || error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }
}
