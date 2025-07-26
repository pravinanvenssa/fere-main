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
    // Authenticate user for all operations
    const user = await authenticateUser(req);
    req.user = user;

    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    switch (req.method) {
      case 'GET':
        await getUser(req, res, id);
        break;
      case 'PUT':
        await updateUser(req, res, id);
        break;
      case 'DELETE':
        await deleteUser(req, res, id);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    if (error.message === 'Access token required' || error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Get single user (requires users:read permission)
async function getUser(req, res, userId) {
  // Check permission
  const hasPermission = req.user.permissions.some(p => 
    p.resource === 'users' && p.action === 'read'
  );
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format user data
    const formattedUser = {
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
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// Update user (requires users:update permission)
async function updateUser(req, res, userId) {
  // Check permission
  const hasPermission = req.user.permissions.some(p => 
    p.resource === 'users' && p.action === 'update'
  );
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    const { email, firstName, lastName, isActive, roleIds } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user data
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update roles if provided
    if (roleIds !== undefined) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId }
      });

      // Add new roles
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          userId,
          roleId
        }));

        await prisma.userRole.createMany({
          data: userRoles
        });
      }
    }

    // Fetch updated user with roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
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

    res.status(200).json({
      message: 'User updated successfully',
      user: formattedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

// Delete user (requires users:delete permission)
async function deleteUser(req, res, userId) {
  // Check permission
  const hasPermission = req.user.permissions.some(p => 
    p.resource === 'users' && p.action === 'delete'
  );
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user roles first (due to foreign key constraints)
    await prisma.userRole.deleteMany({
      where: { userId }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}
