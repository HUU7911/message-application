const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Cắt vuông ở giữa, thu về size×size và nén JPEG.
 * Spring mặc định giới hạn upload 1 MB; ảnh sau xử lý thường chỉ vài chục KB.
 */
export async function squareAvatarBlob(file: File, size = 512): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Hãy chọn một tệp ảnh (JPG, PNG hoặc WebP).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('Ảnh quá lớn. Hãy chọn ảnh dưới 15 MB.');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Không đọc được ảnh này. Hãy thử ảnh khác.');
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
  }
  ctx.fillStyle = '#ffffff'; // PNG trong suốt sẽ có nền trắng khi sang JPEG
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  if (!blob) throw new Error('Không xử lý được ảnh. Hãy thử ảnh khác.');
  return blob;
}
