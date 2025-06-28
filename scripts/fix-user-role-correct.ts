#!/usr/bin/env tsx

// Load environment variables from .env files
import 'dotenv/config';

import { db } from '../src/server/db';

async function fixUserRoleCorrect() {
  console.log('🔧 Fixing user role back to correct format for ericsungyun@gmail.com...');

  try {
    // Get the user
    const user = await db.user.findUnique({
      where: { email: 'ericsungyun@gmail.com' },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Current role: ${user.role}`);

    // Fix the role to the correct format
    if (user.role === 'admin') {
      // Update the role back to org:admin
      const updatedUser = await db.user.update({
        where: { email: 'ericsungyun@gmail.com' },
        data: { role: 'org:admin' },
      });

      console.log(`✅ Updated role from "${user.role}" to "${updatedUser.role}"`);
    } else if (user.role === 'org:admin') {
      console.log(`✅ Role is already correct: ${user.role}`);
    } else {
      console.log(`❌ Unexpected role format: ${user.role}`);
    }

  } catch (error) {
    console.error('❌ Error fixing user role:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
fixUserRoleCorrect()
  .then(() => {
    console.log('🎉 User role fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 User role fix failed:', error);
    process.exit(1);
  }); 