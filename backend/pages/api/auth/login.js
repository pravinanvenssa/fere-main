import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../utils/db.js';
import cors from '../../../middleware/cors.js';

export default async function handler(req, res) {
  // Apply CORS
  cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email },
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
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Prepare user data for JWT
    const roles = user.userRoles.map(ur => ur.role);
    const permissions = roles.flatMap(role => 
      role.rolePermissions.map(rp => rp.permission)
    );

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      }))
    };

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, roles: roles.map(r => r.name) },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userData,
      expiresIn: 15 * 60 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
