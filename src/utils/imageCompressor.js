/**
 * Client-side image compression and resizing utility
 * Resizes images to ~1024px maximum dimension before uploading to /api/analyze
 * per SPEC.md Section 6 and 8.
 */

export async function compressImage(file, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for compression'));
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get 2D canvas context'));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Also compute approximate size
        const base64Data = dataUrl.split(',')[1] || '';
        const sizeBytes = Math.round((base64Data.length * 3) / 4);

        resolve({
          dataUrl,
          base64: base64Data,
          mimeType: 'image/jpeg',
          width,
          height,
          sizeBytes,
          sizeKb: Math.round(sizeBytes / 1024),
        });
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image file into Image object'));
      };

      img.src = readerEvent.target.result;
    };

    reader.onerror = (err) => {
      reject(new Error('Failed to read file as Data URL'));
    };

    reader.readAsDataURL(file);
  });
}
