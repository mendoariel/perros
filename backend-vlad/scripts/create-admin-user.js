const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'admin'
      }
    });

    if (existingUser) {
      console.log('Admin user already exists with ID:', existingUser.id);
      return;
    }

    // Hash the password
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    // Generate a random hash for registration
    const hashToRegister = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create the admin user
    // Note: Using FRIAS_EDITOR role as ADMIN doesn't exist in the Role enum
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin',
        hash: hash,
        username: 'admin',
        role: 'FRIAS_EDITOR',
        hashToRegister: hashToRegister,
        userStatus: 'ACTIVE'
      }
    });

    console.log('Admin user created successfully with ID:', adminUser.id);
    console.log('Email: admin');
    console.log('Password: admin123');
    console.log('Role: FRIAS_EDITOR (admin privileges)');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
