export async function compressImage(file: File, maxSizeKB: number = 450): Promise<File> {
    // If already smaller, return as is
    if (file.size / 1024 <= maxSizeKB) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            let width = img.width;
            let height = img.height;

            // Max dimensions (e.g., HD 1920x1080) to save space immediately
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1920;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = Math.round((height *= MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = Math.round((width *= MAX_HEIGHT / height));
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(file); // Fail safe
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Iterative compression
            let quality = 0.9;
            const compress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }

                        if (blob.size / 1024 <= maxSizeKB || quality <= 0.2) {
                            // Done or reached min quality
                            const newFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            // Try lower quality
                            quality -= 0.1;
                            compress();
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            compress();
        };

        img.onerror = (error) => reject(error);
    });
}
