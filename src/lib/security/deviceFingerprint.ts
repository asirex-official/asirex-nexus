// Device fingerprinting utility for security tracking
// Creates a unique identifier for the device/browser combination

interface DeviceInfo {
  fingerprint: string;
  components: {
    userAgent: string;
    language: string;
    colorDepth: number;
    screenResolution: string;
    timezone: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
    touchSupport: boolean;
    webglVendor: string;
    webglRenderer: string;
    canvasFingerprint: string;
  };
}

// Generate a hash from string using Web Crypto API
async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get WebGL info for fingerprinting
function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { vendor: 'unknown', renderer: 'unknown' };
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return { vendor: 'unknown', renderer: 'unknown' };
    
    return {
      vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
      renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
    };
  } catch {
    return { vendor: 'unknown', renderer: 'unknown' };
  }
}

// Generate canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unsupported';
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw complex pattern
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ASIREX Security', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ASIREX Security', 4, 17);
    
    return canvas.toDataURL().slice(-50);
  } catch {
    return 'unsupported';
  }
}

// Get touch support info
function getTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Generate device fingerprint
export async function generateDeviceFingerprint(): Promise<DeviceInfo> {
  const webglInfo = getWebGLInfo();
  const canvasFingerprint = getCanvasFingerprint();
  
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory,
    touchSupport: getTouchSupport(),
    webglVendor: webglInfo.vendor,
    webglRenderer: webglInfo.renderer,
    canvasFingerprint
  };
  
  // Create fingerprint string from components
  const fingerprintString = Object.values(components).join('|');
  const fingerprint = await generateHash(fingerprintString);
  
  return {
    fingerprint,
    components
  };
}

// Get a friendly device name
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  
  return `${browser} on ${os}`;
}

// Store fingerprint in session
export function storeDeviceFingerprint(fingerprint: string): void {
  sessionStorage.setItem('device_fingerprint', fingerprint);
}

// Get stored fingerprint
export function getStoredDeviceFingerprint(): string | null {
  return sessionStorage.getItem('device_fingerprint');
}
