export const getFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();

    fr.onload = (e) => {
      resolve(e.target?.result as string);
    };

    fr.onerror = (e) => {
      reject(e.target?.error);
    };

    fr.readAsDataURL(file);
  });
};

export const getImageDataFromDataUrl = (
  dataURL: string,
): Promise<{ naturalHeight: number; naturalWidth: number }> => {
  const img = new Image();

  return new Promise<{ naturalHeight: number; naturalWidth: number }>(
    (resolve) => {
      img.onload = () => {
        resolve({
          naturalHeight: img.naturalHeight,
          naturalWidth: img.naturalWidth,
        });
      };

      img.src = dataURL;
    },
  ).finally(() => img.remove());
};
