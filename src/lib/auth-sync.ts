// Auth sync disabled for landing page deployment
// TODO: Restore from auth-sync.ts.bak after deployment

export interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

export class AuthSyncService {
  static async syncUser(userId: string): Promise<SyncResult> {
    return {
      success: false,
      message: "Auth sync disabled for landing page",
      error: "DISABLED"
    };
  }
}

export const authSync = new AuthSyncService();
