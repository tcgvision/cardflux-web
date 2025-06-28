#!/usr/bin/env tsx

// Load environment variables from .env files
import 'dotenv/config';

import { db } from '../src/server/db';
import { normalizeRole } from '../src/lib/roles';

async function fixUserRole() {
  console.log('🔧 Fixing user role for ericsungyun@gmail.com...');

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

    // Normalize the role
    const normalizedRole = normalizeRole(user.role);
    
    if (normalizedRole && normalizedRole !== user.role) {
      // Update the role
      const updatedUser = await db.user.update({
        where: { email: 'ericsungyun@gmail.com' },
        data: { role: normalizedRole },
      });

      console.log(`✅ Updated role from "${user.role}" to "${updatedUser.role}"`);
    } else if (normalizedRole) {
      console.log(`✅ Role is already normalized: ${user.role}`);
    } else {
      console.log(`❌ Invalid role: ${user.role}`);
    }

  } catch (error) {
    console.error('❌ Error fixing user role:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
fixUserRole()
  .then(() => {
    console.log('🎉 User role fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 User role fix failed:', error);
    process.exit(1);
  }); 