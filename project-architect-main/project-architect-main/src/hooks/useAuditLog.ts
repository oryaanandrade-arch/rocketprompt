import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Comprehensive list of all auditable events
export type AuditEventType = 
  // Authentication events
  | 'login_success'
  | 'login_failed'
  | 'signup_success'
  | 'signup_failed'
  | 'logout'
  | 'password_reset_requested'
  | 'password_change_success'
  | 'password_change_failed'
  | 'session_refresh'
  // Access control events
  | 'access_denied_no_plan'
  | 'access_denied_email_not_verified'
  | 'access_denied_blocked'
  | 'access_denied_unauthorized'
  // Account management events
  | 'profile_update_success'
  | 'profile_update_failed'
  | 'account_data_change'
  // Project events
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  // Admin events
  | 'admin_action'
  | 'admin_user_blocked'
  | 'admin_user_unblocked'
  | 'admin_role_changed';

interface AuditLogData {
  eventType: AuditEventType;
  userId?: string;
  success?: boolean;
  errorMessage?: string;
  metadata?: Json;
}

// Standalone function for use outside of React components
export async function logAuditEvent({
  eventType,
  userId,
  success = true,
  errorMessage,
  metadata = {}
}: AuditLogData) {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      event_type: eventType,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: metadata as { [key: string]: string | number | boolean | null }
    }]);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Hook for use in React components
export function useAuditLog() {
  const logEvent = async (data: AuditLogData) => {
    await logAuditEvent(data);
  };

  return { logEvent };
}
