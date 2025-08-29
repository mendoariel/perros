const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const FILE_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'files');
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;
const SOCIAL_IMAGE_QUALITY = 85;

/**
 * Get social media filename from original filename
 */
function getSocialFilename(originalFilename) {
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  return `${name}-social${ext}`;
}

/**
 * Resize image for social media sharing
 */
async function resizeForSocialMedia(originalFilename) {
  const originalPath = path.join(FILE_UPLOAD_DIR, originalFilename);
  const socialFilename = getSocialFilename(originalFilename);
  const socialPath = path.join(FILE_UPLOAD_DIR, socialFilename);

  // Check if social image already exists
  if (fs.existsSync(socialPath)) {
    console.log(`Social image already exists: ${socialFilename}`);
    return socialFilename;
  }

  try {
    // Resize image for social media
    await sharp(originalPath)
      .resize(SOCIAL_IMAGE_WIDTH, SOCIAL_IMAGE_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: SOCIAL_IMAGE_QUALITY })
      .toFile(socialPath);

    console.log(`Created social image: ${socialFilename}`);
    return socialFilename;
  } catch (error) {
    console.error(`Error resizing ${originalFilename}:`, error.message);
    throw error;
  }
}

/**
 * Process all existing images to create social versions
 */
async function processAllExistingImages() {
  try {
    console.log('Starting to process existing images...');
    console.log(`Looking for images in: ${FILE_UPLOAD_DIR}`);

    // Check if directory exists
    if (!fs.existsSync(FILE_UPLOAD_DIR)) {
      console.error(`Directory does not exist: ${FILE_UPLOAD_DIR}`);
      return;
    }

    const files = fs.readdirSync(FILE_UPLOAD_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && 
      !file.includes('-social')
    );

    console.log(`Found ${imageFiles.length} images to process`);

    let processedCount = 0;
    let errorCount = 0;
    
    for (const imageFile of imageFiles) {
      try {
        await resizeForSocialMedia(imageFile);
        processedCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to process ${imageFile}:`, error.message);
      }
    }

    console.log('\n=== Processing Complete ===');
    console.log(`Successfully processed: ${processedCount} images`);
    console.log(`Errors: ${errorCount} images`);
    console.log(`Total images found: ${imageFiles.length}`);

  } catch (error) {
    console.error('Error processing existing images:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  processAllExistingImages()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  processAllExistingImages,
  resizeForSocialMedia
};
