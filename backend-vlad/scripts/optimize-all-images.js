const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const FILE_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'files');
const AVATAR_UPLOAD_DIR = path.join(FILE_UPLOAD_DIR, 'users', 'avatars');

const OPTIMIZED_IMAGE_WIDTH = 800; // Máximo ancho
const OPTIMIZED_IMAGE_QUALITY = 80;

/**
 * Optimizes a single image in place
 */
async function optimizeImage(filePath) {
  try {
    const tempPath = `${filePath}.temp`;
    
    // Resize and compress
    await sharp(filePath)
      .resize(OPTIMIZED_IMAGE_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: OPTIMIZED_IMAGE_QUALITY, force: false })
      .png({ quality: OPTIMIZED_IMAGE_QUALITY, force: false })
      .webp({ quality: OPTIMIZED_IMAGE_QUALITY, force: false })
      .toFile(tempPath);

    // Overwrite
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    return true;
  } catch (error) {
    console.error(`Error optimizing image ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

/**
 * Process a directory of images
 */
async function processDirectory(dirPath, description) {
  console.log(`\n--- Starting to process ${description} ---`);
  console.log(`Looking for images in: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}. Skipping.`);
    return { processed: 0, errors: 0, total: 0 };
  }

  const files = fs.readdirSync(dirPath);
  
  // Filter for valid image formats and ignore the social media versions
  let imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file) && 
    !file.includes('-social')
  );
  
  // Also filter out directories
  imageFiles = imageFiles.filter(file => {
      const fullPath = path.join(dirPath, file);
      return fs.statSync(fullPath).isFile();
  });

  console.log(`Found ${imageFiles.length} images to process in ${description}`);

  let processedCount = 0;
  let errorCount = 0;
  
  for (const imageFile of imageFiles) {
    const fullPath = path.join(dirPath, imageFile);
    const originalSize = fs.statSync(fullPath).size;
    
    const success = await optimizeImage(fullPath);
    
    if (success) {
      const newSize = fs.statSync(fullPath).size;
      const savedKb = Math.round((originalSize - newSize) / 1024);
      processedCount++;
      // Only log if it actually reduced the size significantly
      if (savedKb > 10) {
           console.log(`Optimized ${imageFile}: Saved ${savedKb} KB`);
      }
    } else {
      errorCount++;
    }
  }

  console.log(`--- Finished processing ${description} ---`);
  return { processed: processedCount, errors: errorCount, total: imageFiles.length };
}

/**
 * Main execution
 */
async function run() {
  try {
    const petsResult = await processDirectory(FILE_UPLOAD_DIR, "Pets Images");
    const avatarsResult = await processDirectory(AVATAR_UPLOAD_DIR, "User Avatars");

    const totalProcessed = petsResult.processed + avatarsResult.processed;
    const totalErrors = petsResult.errors + avatarsResult.errors;
    const totalFound = petsResult.total + avatarsResult.total;

    console.log('\n=== COMPLETE OPTIMIZATION SUMMARY ===');
    console.log(`Total images found: ${totalFound}`);
    console.log(`Successfully optimized: ${totalProcessed}`);
    console.log(`Errors: ${totalErrors}`);
    
    console.log('\nNote: Images that were already smaller/optimized might not show significant size reduction.');
  } catch (error) {
    console.error('Fatal error running optimization script:', error);
  }
}

// Run the script
if (require.main === module) {
  run()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
