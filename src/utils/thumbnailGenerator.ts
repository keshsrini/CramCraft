/**
 * Generates a thumbnail for an image file
 * @param file - The image file to generate a thumbnail for
 * @param maxWidth - Maximum width of the thumbnail (default: 128px)
 * @param maxHeight - Maximum height of the thumbnail (default: 128px)
 * @returns Promise that resolves to a data URL of the thumbnail
 */
export async function generateThumbnail(
  file: File,
  maxWidth: number = 128,
  maxHeight: number = 128
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a file is an image that can have a thumbnail generated
 */
export function canGenerateThumbnail(file: File): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return imageTypes.includes(file.type.toLowerCase());
}
