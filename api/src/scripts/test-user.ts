import dotenv from 'dotenv';
import { testConnection, closeConnection } from '../config/database';
import { User } from '../models/User';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function testUser(): Promise<void> {
  try {
    console.log('🔍 Testing user lookup...');
    
    // Test connection
    await testConnection();
    
    // Try to find the demo user
    console.log('Looking for user with username "demo"');
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: 'demo' }, { email: 'demo' }],
      },
    });
    
    if (user) {
      console.log('✅ Found user:', user.username, user.email);
      console.log('User ID:', user.id);
      console.log('Password hash:', user.passwordHash);
      
      // Test password verification
      const isValid = await bcrypt.compare('Demo123!', user.passwordHash);
      console.log('Password valid:', isValid);
    } else {
      console.log('❌ User not found');
      
      // List all users
      const allUsers = await User.findAll();
      console.log('All users in database:', allUsers.map(u => ({ id: u.id, username: u.username, email: u.email })));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeConnection();
  }
}

if (require.main === module) {
  testUser();
}

export { testUser };