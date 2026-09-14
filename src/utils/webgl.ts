/**
 * Helper to safely detect if WebGL / WebGL2 context can be initialized
 * without throwing unhandled exceptions or triggering context blocks.
 */
export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(gl && (gl as WebGLRenderingContext).getExtension);
  } catch (e) {
    return false;
  }
}
