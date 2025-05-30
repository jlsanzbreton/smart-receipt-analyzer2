
// This file can be expanded with more image utilities if needed,
// such as resizing, compression, etc. For now, base64 conversion
// is typically handled by FileReader API directly in the component.

/**
 * Converts a File object to a base64 string.
 * @param file The image file.
 * @returns A promise that resolves with the base64 string (including data URI prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// If you need just the data part (without `data:mime/type;base64,`)
export const getBase64Data = (fullBase64: string): string => {
  return fullBase64.split(',')[1];
};
