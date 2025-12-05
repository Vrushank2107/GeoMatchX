const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'build',
  'dist',
  'coverage'
];

// Replacement patterns
const REPLACEMENTS = [
  // Exact word matches (case-sensitive)
  { from: 'worker', to: 'candidate' },
  { from: 'Worker', to: 'Candidate' },
  { from: 'WORKER', to: 'CANDIDATE' },
  
  // Plurals
  { from: 'workers', to: 'candidates' },
  { from: 'Workers', to: 'Candidates' },
  { from: 'WORKERS', to: 'CANDIDATES' }
];

// Helper function to check if a path should be ignored
function shouldIgnore(filePath) {
  return IGNORE_DIRS.some(dir => filePath.includes(`/${dir}/`));
}

// Function to rename files and directories
function renameFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (shouldIgnore(fullPath)) {
      continue;
    }

    // Rename directories and files
    let newName = entry.name;
    let wasRenamed = false;
    
    for (const { from, to } of REPLACEMENTS) {
      if (entry.name.includes(from)) {
        newName = newName.replace(new RegExp(from, 'g'), to);
        wasRenamed = true;
      }
    }

    if (wasRenamed) {
      const newPath = path.join(dir, newName);
      console.log(`Renaming: ${fullPath} -> ${newPath}`);
      fs.renameSync(fullPath, newPath);
      
      // Update the full path for recursive processing
      if (entry.isDirectory()) {
        renameFiles(newPath);
      }
    } else if (entry.isDirectory()) {
      renameFiles(fullPath);
    }
  }
}

// Function to update file contents
function updateFileContents(filePath) {
  if (shouldIgnore(filePath) || !fs.statSync(filePath).isFile()) {
    return;
  }

  // Skip binary files
  const isText = ['text', 'json', 'javascript', 'typescript', 'jsx', 'tsx', 'css', 'scss', 'html', 'md']
    .some(ext => filePath.endsWith(`.${ext}`) || filePath.includes(`.${ext}/`));
  
  if (!isText) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    for (const { from, to } of REPLACEMENTS) {
      const regex = new RegExp(`\\b${from}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, to);
        updated = true;
      }
    }

    if (updated) {
      console.log(`Updating: ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to process all files recursively
function processFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (shouldIgnore(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      processFiles(fullPath);
    } else {
      updateFileContents(fullPath);
    }
  }
}

// Main function
function main() {
  console.log('Starting to update worker to candidate...');
  
  try {
    // First update file contents (safer to do before renaming files)
    console.log('\nUpdating file contents...');
    processFiles(ROOT_DIR);
    
    // Then rename files and directories
    console.log('\nRenaming files and directories...');
    renameFiles(ROOT_DIR);
    
    console.log('\nUpdate completed successfully!');
    console.log('Please review the changes and run your tests to ensure everything works as expected.');
  } catch (error) {
    console.error('Error during update:', error);
    process.exit(1);
  }
}

// Run the script
main();
