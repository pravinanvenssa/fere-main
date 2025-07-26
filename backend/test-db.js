const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPasswordAndUser() {
  try {
    console.log('🔍 Testing database connection and user authentication...\n');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
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
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.userRoles.length
    });
    
    // Test password verification
    const testPassword = 'admin123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password);
    
    if (isValidPassword) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
      console.log('Stored hash:', user.password);
      
      // Let's test what the hash should be
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('Expected hash format:', newHash);
    }
    
    // Test roles and permissions
    if (user.userRoles.length > 0) {
      console.log('✅ User has roles:', user.userRoles.map(ur => ur.role.name));
      
      const permissions = user.userRoles.flatMap(ur => 
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );
      console.log('✅ User permissions:', permissions);
    } else {
      console.log('⚠️ User has no roles assigned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordAndUser();
