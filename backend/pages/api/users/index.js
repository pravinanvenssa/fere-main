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

  try {
    // Authenticate user for all user operations
    const user = await authenticateUser(req);
    req.user = user;

    switch (req.method) {
      case 'GET':
        await getUsers(req, res);
        break;
      case 'POST':
        await createUser(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    if (error.message === 'Access token required' || error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Get all users (requires users:read permission)
async function getUsers(req, res) {
  // Check permission
  const hasPermission = req.user.permissions.some(p => 
    p.resource === 'users' && p.action === 'read'
  );
  
  if (!hasPermission) {
    res.status(403).json({ error: 'Permission denied' });
    return;
  }

  try {
    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format users data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        permissions: ur.role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      }))
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Create new user (requires users:create permission)
async function createUser(req, res) {
  // Check permission
  const hasPermission = req.user.permissions.some(p => 
    p.resource === 'users' && p.action === 'create'
  );
  
  if (!hasPermission) {
    res.status(403).json({ error: 'Permission denied' });
    return;
  }

  try {
    const { email, firstName, lastName, password, roleIds = [] } = req.body;

    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ 
        error: 'Email, first name, last name, and password are required' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    // Hash password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        isActive: true
      }
    });

    // Assign roles if provided
    if (roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        userId: newUser.id,
        roleId
      }));

      await prisma.userRole.createMany({
        data: userRoles
      });
    } else {
      // Assign default user role if no roles provided
      const userRole = await prisma.role.findUnique({
        where: { name: 'user' }
      });

      if (userRole) {
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userRole.id
          }
        });
      }
    }

    // Fetch created user with roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: newUser.id },
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

    // Format response
    const formattedUser = {
      id: userWithRoles.id,
      email: userWithRoles.email,
      firstName: userWithRoles.firstName,
      lastName: userWithRoles.lastName,
      isActive: userWithRoles.isActive,
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
      roles: userWithRoles.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        permissions: ur.role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      }))
    };

    res.status(201).json({
      message: 'User created successfully',
      user: formattedUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}
