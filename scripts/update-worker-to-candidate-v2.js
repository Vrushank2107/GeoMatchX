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
  'coverage',
  'scripts' // Don't process the scripts directory
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
  const relativePath = path.relative(ROOT_DIR, filePath);
  const firstDir = relativePath.split(path.sep)[0];
  return IGNORE_DIRS.some(dir => 
    filePath.includes(`${path.sep}${dir}${path.sep}`) || 
    firstDir === dir ||
    filePath.endsWith(`/${dir}`) ||
    filePath === dir
  );
}

// Function to update file contents
function updateFileContents(filePath) {
  if (shouldIgnore(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  // Skip binary and non-text files
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.html', '.md', '.txt'];
  
  if (!textExtensions.includes(ext)) {
    return false;
  }

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
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Function to process all files recursively
function processFiles(dir) {
  if (shouldIgnore(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  // First process files in the current directory
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isFile()) {
      updateFileContents(fullPath);
    }
  }
  
  // Then process subdirectories
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processFiles(fullPath);
    }
  }
}

// Function to rename files and directories
function renameFiles(dir) {
  if (shouldIgnore(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    
    if (shouldIgnore(oldPath)) {
      continue;
    }

    // Process directories first
    if (entry.isDirectory()) {
      renameFiles(oldPath);
    }
    
    // Check if the name needs to be changed
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
      
      // Skip if the new path is the same as the old path
      if (oldPath === newPath) {
        continue;
      }
      
      console.log(`Renaming: ${oldPath} -> ${newPath}`);
      
      try {
        // If the destination exists, remove it first
        if (fs.existsSync(newPath)) {
          if (fs.lstatSync(newPath).isDirectory()) {
            fs.rmdirSync(newPath, { recursive: true });
          } else {
            fs.unlinkSync(newPath);
          }
        }
        
        fs.renameSync(oldPath, newPath);
      } catch (error) {
        console.error(`Error renaming ${oldPath} to ${newPath}:`, error.message);
      }
    }
  }
}

// Main function
function main() {
  console.log('Starting to update worker to candidate...');
  
  try {
    // First update file contents
    console.log('\nUpdating file contents...');
    processFiles(ROOT_DIR);
    
    // Then rename files and directories
    console.log('\nRenaming files and directories...');
    renameFiles(ROOT_DIR);
    
    // Update file contents again to catch any remaining references
    console.log('\nUpdating file contents again...');
    processFiles(ROOT_DIR);
    
    console.log('\nUpdate completed successfully!');
    console.log('Please review the changes and run your tests to ensure everything works as expected.');
  } catch (error) {
    console.error('Error during update:', error);
    process.exit(1);
  }
}

// Run the script
main();
