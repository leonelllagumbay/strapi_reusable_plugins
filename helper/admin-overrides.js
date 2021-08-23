/**
 * Helper function/file to override admin models.
 * Since as for now admin model cannot be overriden by default using extensions
 * coz it's not a plugin
 */

const fs = require('fs');

// override admin index.html to add Stripe scripte
dir = './admin/src/index.html';
dirDist = './node_modules/strapi-admin/index.html';
fs.copyFileSync(dir, dirDist);