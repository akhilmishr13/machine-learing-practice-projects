#!/usr/bin/env node

/**
 * JournalApp Setup Script (Node.js version)
 * Installs all required dependencies and sets up the environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m'; // No Color

function log(message, color = NC) {
  console.log(`${color}${message}${NC}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    if (!options.ignoreErrors) {
      throw error;
    }
  }
}

function checkNodeVersion() {
  log('📦 Checking Node.js version...', BLUE);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`⚠️  Warning: Node.js 18+ is recommended. Current version: ${nodeVersion}`, YELLOW);
  } else {
    log(`✅ Node.js version: ${nodeVersion}`, GREEN);
  }
  console.log();
}

function setupEnvFile() {
  log('🔧 Setting up .env file...', BLUE);
  const envPath = path.join(process.cwd(), '.env');
  const envTemplatePath = path.join(process.cwd(), 'env.template');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envTemplatePath)) {
      fs.copyFileSync(envTemplatePath, envPath);
      log('✅ .env file created from env.template', GREEN);
      log('⚠️  Please update .env with your API keys!', YELLOW);
    } else if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ .env file created from .env.example', GREEN);
      log('⚠️  Please update .env with your API keys!', YELLOW);
    } else {
      // Create basic .env file
      const envContent = `# Notion API Configuration
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=com.journalapp:/oauth2callback

# App Configuration
APP_NAME=JournalApp
APP_BUNDLE_ID=com.journalapp
`;
      fs.writeFileSync(envPath, envContent);
      log('✅ .env file created', GREEN);
      log('⚠️  Please update .env with your API keys!', YELLOW);
    }
  } else {
    log('✅ .env file already exists', GREEN);
  }
  console.log();
}

function installDependencies() {
  log('📦 Installing npm dependencies...', BLUE);
  try {
    exec('npm install');
    log('✅ npm dependencies installed', GREEN);
  } catch (error) {
    log('❌ Error installing dependencies', YELLOW);
    throw error;
  }
  console.log();
}

function installIOSDependencies() {
  if (process.platform !== 'darwin') {
    log('⚠️  Not on macOS. Skipping iOS dependencies.', YELLOW);
    console.log();
    return;
  }

  const iosPath = path.join(process.cwd(), 'ios');
  if (!fs.existsSync(iosPath)) {
    log('⚠️  iOS directory not found. Run React Native init first.', YELLOW);
    console.log();
    return;
  }

  log('🍎 Installing iOS dependencies (CocoaPods)...', BLUE);
  try {
    // Check if pod command exists
    exec('which pod', { ignoreErrors: true });
    process.chdir(iosPath);
    exec('pod install');
    process.chdir('..');
    log('✅ iOS dependencies installed', GREEN);
  } catch (error) {
    log('⚠️  CocoaPods not found or error installing. Install with: sudo gem install cocoapods', YELLOW);
    log('⚠️  Then run: cd ios && pod install', YELLOW);
  }
  console.log();
}

function checkRequiredTools() {
  log('🔍 Checking for required tools...', BLUE);
  
  // Check CocoaPods
  if (process.platform === 'darwin') {
    try {
      const podVersion = execSync('pod --version', { encoding: 'utf-8' }).trim();
      log(`✅ CocoaPods installed: ${podVersion}`, GREEN);
    } catch (error) {
      log('⚠️  CocoaPods not installed. Install with: sudo gem install cocoapods', YELLOW);
    }
    
    // Check Xcode
    try {
      execSync('xcodebuild -version', { stdio: 'ignore' });
      log('✅ Xcode installed', GREEN);
    } catch (error) {
      log('⚠️  Xcode not found. Install from Mac App Store.', YELLOW);
    }
  }
  
  // Check Android SDK
  try {
    execSync('adb version', { stdio: 'ignore' });
    log('✅ Android SDK found', GREEN);
  } catch (error) {
    log('⚠️  Android SDK not found. Install Android Studio.', YELLOW);
  }
  
  console.log();
}

function printNextSteps() {
  log('✅ Setup Complete!', GREEN);
  console.log();
  log('📝 Next Steps:', BLUE);
  console.log('1. Update .env file with your API keys:');
  console.log('   - Notion API: https://www.notion.so/my-integrations');
  console.log('   - Google Calendar: https://console.cloud.google.com/');
  console.log();
  console.log('2. For iOS development:');
  console.log('   - Open ios/JournalApp.xcworkspace in Xcode');
  console.log('   - Configure signing & capabilities');
  console.log();
  console.log('3. For Android development:');
  console.log('   - Open android/ in Android Studio');
  console.log('   - Configure signing');
  console.log();
  console.log('4. Start Metro bundler:');
  console.log('   npm start');
  console.log();
  console.log('5. Run on iOS:');
  console.log('   npm run ios');
  console.log();
  console.log('6. Run on Android:');
  console.log('   npm run android');
  console.log();
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting JournalApp Setup...\n');
    
    checkNodeVersion();
    setupEnvFile();
    installDependencies();
    installIOSDependencies();
    checkRequiredTools();
    printNextSteps();
    
  } catch (error) {
    log('❌ Setup failed!', YELLOW);
    console.error(error);
    process.exit(1);
  }
}

main();

