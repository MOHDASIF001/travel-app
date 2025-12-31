export const compressImage = (base64Str: string, maxWidth = 1280, maxHeight = 720, targetSizeBytes = 70000): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Resize if needed
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Recursive function to find best quality
            const attemptCompression = (quality: number) => {
                const compressed = canvas.toDataURL('image/jpeg', quality);
                const size = Math.round((compressed.length - 'data:image/jpeg;base64,'.length) * 3 / 4);

                if (size <= targetSizeBytes || quality <= 0.1) {
                    resolve(compressed);
                } else {
                    attemptCompression(quality - 0.1);
                }
            };

            attemptCompression(0.8);
        };
    });
};
