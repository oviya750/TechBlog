// Navbar Active State Logic Unit & Route Mapping Verification
const routesToTest = [
  { path: '/', expectedActive: 'Home' },
  { path: '/blog', expectedActive: 'All Articles' },
  { path: '/blog/zero-trust-beyond-the-perimeter-ephemeral-identity', expectedActive: 'All Articles' },
  { path: '/category/cybersecurity', expectedActive: 'Categories' },
  { path: '/category/artificial-intelligence-machine-learning', expectedActive: 'Categories' },
  { path: '/about', expectedActive: 'About' },
  { path: '/contact', expectedActive: 'Contact' },
  { path: '/search', expectedActive: 'None' },
  { path: '/admin', expectedActive: 'None' },
  { path: '/admin/posts', expectedActive: 'None' },
  { path: '/admin/login', expectedActive: 'None' }
];

function resolveActiveNav(pathname) {
  const isHomeActive = pathname === '/';
  const isArticlesActive =
    !pathname.startsWith('/admin') &&
    (pathname === '/blog' || (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/category')));
  const isCategoriesActive =
    !pathname.startsWith('/admin') &&
    (pathname.startsWith('/category/') || pathname === '/category' || pathname === '/categories');
  const isAboutActive =
    !pathname.startsWith('/admin') && (pathname === '/about' || pathname.startsWith('/about/'));
  const isContactActive =
    !pathname.startsWith('/admin') && (pathname === '/contact' || pathname.startsWith('/contact/'));

  const activeItems = [];
  if (isHomeActive) activeItems.push('Home');
  if (isArticlesActive) activeItems.push('All Articles');
  if (isCategoriesActive) activeItems.push('Categories');
  if (isAboutActive) activeItems.push('About');
  if (isContactActive) activeItems.push('Contact');

  return activeItems;
}

console.log('================================================================');
console.log('   NAVBAR MUTUALLY EXCLUSIVE ACTIVE STATE AUDIT                 ');
console.log('================================================================\n');

let failed = 0;

routesToTest.forEach(({ path, expectedActive }) => {
  const activeItems = resolveActiveNav(path);
  const activeName = activeItems.length === 0 ? 'None' : activeItems.join(', ');
  const isMatch = (expectedActive === 'None' && activeItems.length === 0) || (activeItems.length === 1 && activeItems[0] === expectedActive);

  if (isMatch) {
    console.log(`✅ [PASS] Route "${path}": Active item -> [${activeName}] (Expected: [${expectedActive}])`);
  } else {
    console.error(`❌ [FAIL] Route "${path}": Active items -> [${activeName}] (Expected: [${expectedActive}])`);
    failed++;
  }
});

console.log('\n================================================================');
if (failed === 0) {
  console.log('🎉 ALL 11 ROUTE ACTIVE-STATE CHECKS PASSED (100% MUTUALLY EXCLUSIVE)!');
} else {
  console.error(`⚠️ ${failed} CHECKS FAILED.`);
}
console.log('================================================================\n');

process.exit(failed === 0 ? 0 : 1);
