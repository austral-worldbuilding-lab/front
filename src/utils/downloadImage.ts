export function generateImageFilename(mandalaName: string): string {
  const sanitizedName = mandalaName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  return `${sanitizedName}-awbl-${randomNum}.png`;
}

export async function downloadImage(imageUrl: string, filename?: string): Promise<void> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  const finalFilename = filename || `imagen-${Date.now()}.png`;
  link.download = finalFilename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

