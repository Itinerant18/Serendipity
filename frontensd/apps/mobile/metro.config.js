const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Force Metro to resolve modules within the project folder only
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Ensure we only watch the local project and don't leak into other drives
config.watchFolders = [projectRoot];

module.exports = config;
