/**
 * Compresses an image file using HTML5 Canvas.
 * Max width: 1920px
 * Quality: 0.7 (JPEG)
 * 
 * @param {File} file - The image file to compress
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const MAX_WIDTH = 1920;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw to canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG with 0.7 quality
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }

                    // Create a new File from the blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                }, 'image/jpeg', 0.7);
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
};
