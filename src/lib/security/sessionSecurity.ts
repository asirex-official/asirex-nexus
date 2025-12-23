// Session security utilities
import { supabase } from "@/integrations/supabase/client";

// Generate a secure session token
export async function generateSessionToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Hash a session token
export async function hashSessionToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Store session token locally
export function storeSessionToken(token: string): void {
  // Store in sessionStorage (cleared when browser closes)
  sessionStorage.setItem('secure_session_token', token);
}

// Get stored session token
export function getStoredSessionToken(): string | null {
  return sessionStorage.getItem('secure_session_token');
}

// Clear session token
export function clearSessionToken(): void {
  sessionStorage.removeItem('secure_session_token');
  sessionStorage.removeItem('device_fingerprint');
}

// Log security event to database
export async function logSecurityEvent(
  actionType: string,
  actionCategory: string = 'general',
  riskLevel: string = 'low',
  details: Record<string, string | number | boolean | null> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_action_type: actionType,
      p_action_category: actionCategory,
      p_ip_address: null, // Will be set by edge function if needed
      p_user_agent: navigator.userAgent,
      p_device_fingerprint: sessionStorage.getItem('device_fingerprint'),
      p_risk_level: riskLevel,
      p_details: details as unknown as Record<string, never>
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Check if user needs re-authentication
export async function needsReauthentication(
  lastAuthTime: Date,
  sensitiveActionTimeoutMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<boolean> {
  const now = new Date();
  const timeSinceAuth = now.getTime() - lastAuthTime.getTime();
  return timeSinceAuth > sensitiveActionTimeoutMs;
}

// Validate session integrity
export async function validateSessionIntegrity(
  storedFingerprint: string | null,
  currentFingerprint: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!storedFingerprint) {
    return { valid: true }; // First time, allow
  }
  
  if (storedFingerprint !== currentFingerprint) {
    return { 
      valid: false, 
      reason: 'Device fingerprint mismatch - possible session hijacking detected'
    };
  }
  
  return { valid: true };
}

// Get user security settings
export async function getUserSecuritySettings(userId: string) {
  const { data, error } = await supabase
    .from('user_security_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    // If no settings exist, create them
    if (error.code === 'PGRST116') {
      const { data: newData } = await supabase
        .from('user_security_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      return newData;
    }
    throw error;
  }
  
  return data;
}

// Update user security settings
export async function updateUserSecuritySettings(
  userId: string,
  settings: Partial<{
    require_2fa: boolean;
    is_2fa_setup_complete: boolean;
    session_timeout_minutes: number;
    require_reauth_for_sensitive: boolean;
    notify_new_login: boolean;
  }>
) {
  const { error } = await supabase
    .from('user_security_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  
  if (error) throw error;
}

// Check if 2FA is required for user
export async function is2FARequired(userId: string): Promise<boolean> {
  try {
    // Check if user has admin/staff role - they MUST have 2FA
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    const isStaff = roles?.some(r => 
      ['super_admin', 'admin', 'manager', 'developer', 'employee', 'core_member'].includes(r.role)
    );
    
    if (isStaff) return true;
    
    // Check user's own security settings
    const settings = await getUserSecuritySettings(userId);
    return settings?.require_2fa || false;
  } catch {
    return false;
  }
}

// Check if 2FA is set up
export async function is2FASetupComplete(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_2fa')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();
    
    return data?.is_enabled || false;
  } catch {
    return false;
  }
}
