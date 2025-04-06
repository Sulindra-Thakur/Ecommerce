const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing ${command}:`, error);
    process.exit(1);
  }
}

// Install root dependencies
console.log('Installing root dependencies...');
runCommand('npm install');

// Make sure @vitejs/plugin-react is installed globally for Vite access
console.log('Installing Vite React plugin globally...');
runCommand('npm install -g @vitejs/plugin-react@4.0.0');

// Install client dependencies
console.log('Installing client dependencies...');
// Create a temporary package.json for client with fixed dependencies
const clientPackagePath = path.join(__dirname, 'client', 'package.json');
const clientPackage = require(clientPackagePath);

// Add @vitejs/plugin-react to dependencies not just devDependencies
clientPackage.dependencies['@vitejs/plugin-react'] = '^4.0.0';

// Write the temporary package.json
fs.writeFileSync(
  path.join(__dirname, 'client', 'temp-package.json'),
  JSON.stringify(clientPackage, null, 2)
);

// Move the temporary package.json to replace the original
fs.renameSync(
  path.join(__dirname, 'client', 'temp-package.json'),
  clientPackagePath
);

// Install client dependencies
runCommand('cd client && npm install --force');

// Install server dependencies
console.log('Installing server dependencies...');
runCommand('cd server && npm install');

// Build client
console.log('Building client...');
runCommand('cd client && npm run build');

console.log('Deployment build completed successfully!');