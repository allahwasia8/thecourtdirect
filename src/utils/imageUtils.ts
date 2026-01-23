
/**
 * Transforms a remote WordPress image URL to a local path
 * e.g. https://thecourtdirect.com/wp-content/uploads/2023/09/image.webp
 * becomes /images/image.webp
 */
export const getLocalImagePath = (remoteUrl: string | null | undefined): string | undefined => {
  if (!remoteUrl) return undefined;
  
  // If it's already a local path, leave it
  if (remoteUrl.startsWith('/images/')) return remoteUrl;
  
  try {
    // Extract filename from URL
    const url = new URL(remoteUrl);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename) {
      // Return local path
      return `/images/${decodeURIComponent(filename)}`;
    }
  } catch (e) {
    // If invalid URL, try basic string manipulation
    const parts = remoteUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      return `/images/${lastPart}`;
    }
  }
  
  return remoteUrl;
};
