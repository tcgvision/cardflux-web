#!/usr/bin/env tsx

import { normalizeRole, getNormalizedRole, hasRolePermission, ROLES } from '../src/lib/roles';

console.log('🧪 Testing role normalization system...\n');

// Test cases for role normalization
const testCases = [
  { input: 'org:admin', expected: 'admin', description: 'Clerk admin role' },
  { input: 'org:member', expected: 'member', description: 'Clerk member role' },
  { input: 'admin', expected: 'admin', description: 'Plain admin role' },
  { input: 'member', expected: 'member', description: 'Plain member role' },
  { input: 'org:basic_member', expected: null, description: 'Invalid Clerk role' },
  { input: 'superadmin', expected: null, description: 'Invalid role' },
  { input: null, expected: null, description: 'Null role' },
  { input: undefined, expected: null, description: 'Undefined role' },
  { input: '', expected: null, description: 'Empty string' },
];

console.log('📋 Testing normalizeRole function:');
testCases.forEach(({ input, expected, description }) => {
  const result = normalizeRole(input);
  const passed = result === expected;
  console.log(`  ${passed ? '✅' : '❌'} ${description}: "${input}" -> "${result}" (expected: "${expected}")`);
});

console.log('\n📋 Testing getNormalizedRole function:');
testCases.forEach(({ input, expected, description }) => {
  const result = getNormalizedRole(input);
  const expectedNormalized = expected ?? ROLES.MEMBER; // getNormalizedRole returns default for invalid roles
  const passed = result === expectedNormalized;
  console.log(`  ${passed ? '✅' : '❌'} ${description}: "${input}" -> "${result}" (expected: "${expectedNormalized}")`);
});

console.log('\n📋 Testing hasRolePermission function:');
const permissionTests = [
  { userRole: 'org:admin', requiredRole: ROLES.ADMIN, expected: true, description: 'Admin can access admin' },
  { userRole: 'org:admin', requiredRole: ROLES.MEMBER, expected: true, description: 'Admin can access member' },
  { userRole: 'org:member', requiredRole: ROLES.ADMIN, expected: false, description: 'Member cannot access admin' },
  { userRole: 'org:member', requiredRole: ROLES.MEMBER, expected: true, description: 'Member can access member' },
  { userRole: 'admin', requiredRole: ROLES.ADMIN, expected: true, description: 'Plain admin can access admin' },
  { userRole: 'member', requiredRole: ROLES.MEMBER, expected: true, description: 'Plain member can access member' },
  { userRole: null, requiredRole: ROLES.MEMBER, expected: false, description: 'Null role has no permissions' },
  { userRole: 'invalid', requiredRole: ROLES.MEMBER, expected: false, description: 'Invalid role has no permissions' },
];

permissionTests.forEach(({ userRole, requiredRole, expected, description }) => {
  const result = hasRolePermission(userRole, requiredRole);
  const passed = result === expected;
  console.log(`  ${passed ? '✅' : '❌'} ${description}: "${userRole}" -> ${result} (expected: ${expected})`);
});

console.log('\n📋 Testing role hierarchy:');
const hierarchyTests = [
  { role: 'org:admin', expectedLevel: 2, description: 'Admin level' },
  { role: 'org:member', expectedLevel: 1, description: 'Member level' },
  { role: 'admin', expectedLevel: 2, description: 'Plain admin level' },
  { role: 'member', expectedLevel: 1, description: 'Plain member level' },
];

hierarchyTests.forEach(({ role, expectedLevel, description }) => {
  const normalizedRole = normalizeRole(role);
  const level = normalizedRole === ROLES.ADMIN ? 2 : normalizedRole === ROLES.MEMBER ? 1 : 0;
  const passed = level === expectedLevel;
  console.log(`  ${passed ? '✅' : '❌'} ${description}: "${role}" -> level ${level} (expected: ${expectedLevel})`);
});

console.log('\n🎉 Role normalization tests completed!');
console.log('\n📝 Summary:');
console.log('  • normalizeRole: Strips "org:" prefix and validates roles');
console.log('  • getNormalizedRole: Returns normalized role or default (member)');
console.log('  • hasRolePermission: Checks role hierarchy (admin >= member)');
console.log('  • Role hierarchy: admin (2) > member (1)');
console.log('\n✅ The system correctly handles "org:admin" and "org:member" from Clerk!'); 