import { supabase } from "@/integrations/supabase/client";

export type AuditActionType = 
  // Team member actions
  | "team_member_added"
  | "team_member_fired"
  | "team_member_updated"
  | "team_member_status_changed"
  | "team_member_role_changed"
  | "team_member_promoted"
  | "team_member_bonus_added"
  | "team_member_salary_updated"
  // Task actions
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  // Meeting actions
  | "meeting_scheduled"
  | "meeting_started"
  | "meeting_cancelled"
  // Order actions
  | "order_status_updated"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_payment_updated"
  // Project actions
  | "project_member_assigned"
  | "project_member_removed"
  | "project_lead_changed"
  | "project_created"
  | "project_updated"
  // Salary & Expense actions
  | "salary_request_created"
  | "salary_request_approved"
  | "salary_request_rejected"
  | "salary_request_paid"
  | "expense_created"
  | "expense_approved"
  | "expense_rejected"
  // Notice actions
  | "notice_posted"
  | "notice_deleted"
  | "notice_updated"
  // Settings actions
  | "settings_changed"
  | "maintenance_mode_toggled"
  // User management actions
  | "user_role_changed"
  | "user_profile_updated"
  | "user_deleted"
  // Content actions
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "event_created"
  | "event_updated"
  | "job_posted"
  // Other
  | "login"
  | "logout"
  | "pin_verified";

export interface AuditLogDetails {
  [key: string]: any;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  action_details: AuditLogDetails;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

class AuditLogger {
  private getUserAgent(): string {
    return typeof navigator !== "undefined" ? navigator.userAgent : "Unknown";
  }

  async log(actionType: AuditActionType, details: AuditLogDetails = {}): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("Audit log: No authenticated user");
        return false;
      }

      const { error } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        action_type: actionType,
        action_details: {
          ...details,
          timestamp: new Date().toISOString(),
        },
        user_agent: this.getUserAgent(),
      });

      if (error) {
        console.error("Failed to create audit log:", error);
        return false;
      }

      console.log(`Audit log created: ${actionType}`, details);
      return true;
    } catch (error) {
      console.error("Audit logging error:", error);
      return false;
    }
  }

  // Convenience methods for common actions
  async logTeamMemberAdded(memberName: string, role: string, department?: string) {
    return this.log("team_member_added", { member_name: memberName, role, department });
  }

  async logTeamMemberFired(memberName: string, memberId: string, reason?: string, permanent?: boolean) {
    return this.log("team_member_fired", { member_name: memberName, member_id: memberId, reason, permanent_delete: permanent });
  }

  async logTeamMemberUpdated(memberName: string, memberId: string, changes: Record<string, any>) {
    return this.log("team_member_updated", { member_name: memberName, member_id: memberId, changes });
  }

  async logTeamMemberStatusChanged(memberName: string, memberId: string, newStatus: string) {
    return this.log("team_member_status_changed", { member_name: memberName, member_id: memberId, new_status: newStatus });
  }

  async logTaskAssigned(taskTitle: string, taskId: string, assigneeName: string, assigneeId: string, priority?: string) {
    return this.log("task_assigned", { task_title: taskTitle, task_id: taskId, assignee_name: assigneeName, assignee_id: assigneeId, priority });
  }

  async logTaskCompleted(taskTitle: string, taskId: string) {
    return this.log("task_completed", { task_title: taskTitle, task_id: taskId });
  }

  async logMeetingScheduled(title: string, meetingId: string, attendeeCount: number, scheduledDate: string) {
    return this.log("meeting_scheduled", { title, meeting_id: meetingId, attendee_count: attendeeCount, scheduled_date: scheduledDate });
  }

  async logOrderStatusUpdated(orderId: string, customerName: string, oldStatus: string, newStatus: string) {
    return this.log("order_status_updated", { order_id: orderId, customer_name: customerName, old_status: oldStatus, new_status: newStatus });
  }

  async logOrderShipped(orderId: string, customerName: string, trackingNumber?: string, trackingProvider?: string) {
    return this.log("order_shipped", { order_id: orderId, customer_name: customerName, tracking_number: trackingNumber, tracking_provider: trackingProvider });
  }

  async logProjectMemberAssigned(projectTitle: string, projectId: string, memberName: string, memberId: string) {
    return this.log("project_member_assigned", { project_title: projectTitle, project_id: projectId, member_name: memberName, member_id: memberId });
  }

  async logProjectLeadChanged(projectTitle: string, projectId: string, memberName: string, memberId: string, promoted: boolean) {
    return this.log("project_lead_changed", { project_title: projectTitle, project_id: projectId, member_name: memberName, member_id: memberId, promoted });
  }

  async logSalaryApproval(memberName: string, memberId: string, amount: number, month: string, year: number, status: string) {
    const actionType = status === "approved" ? "salary_request_approved" : 
                       status === "rejected" ? "salary_request_rejected" : 
                       status === "paid" ? "salary_request_paid" : "salary_request_created";
    return this.log(actionType as AuditActionType, { member_name: memberName, member_id: memberId, amount, month, year });
  }

  async logExpenseApproval(category: string, expenseId: string, amount: number, status: string) {
    const actionType = status === "approved" ? "expense_approved" : "expense_rejected";
    return this.log(actionType as AuditActionType, { category, expense_id: expenseId, amount });
  }

  async logNoticePosted(title: string, noticeId: string, priority: string, recipients: string) {
    return this.log("notice_posted", { title, notice_id: noticeId, priority, recipients });
  }

  async logNoticeDeleted(title: string, noticeId: string) {
    return this.log("notice_deleted", { title, notice_id: noticeId });
  }

  async logSettingsChanged(settingKey: string, oldValue: any, newValue: any) {
    return this.log("settings_changed", { setting_key: settingKey, old_value: oldValue, new_value: newValue });
  }

  async logMaintenanceModeToggled(enabled: boolean) {
    return this.log("maintenance_mode_toggled", { enabled });
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Hook for React components
export function useAuditLog() {
  return auditLogger;
}
