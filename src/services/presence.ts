/**
 * Presence Service - Real-time Collaboration Tracking
 * 
 * Gestiona presencia de usuarios en tiempo real: quién está online/offline,
 * en qué proyecto están trabajando, y sesiones de colaboración activas.
 * Utiliza Firebase Realtime Database para sincronización instantánea.
 */

import { database } from '@/config/firebase';
import { ref, set, onValue, onDisconnect, serverTimestamp, push, get } from 'firebase/database';

export interface UserPresence {
  userId: string;
  userName?: string;
  projectId: string;
  status: 'online' | 'offline';
  lastSeen: number;
  activeComponent?: string;
}

export interface CollaborationSession {
  sessionId: string;
  projectId: string;
  users: Record<string, UserPresence>;
  startTime: number;
  lastActivity: number;
}

class PresenceService {
  private isEnabled: boolean = false;
  private currentUserId: string | null = null;
  private currentProjectId: string | null = null;
  private presenceRef: any = null;
  private listeners: Record<string, any> = {};

  constructor() {
    this.isEnabled = !!database;
    
    if (!this.isEnabled) {
      console.warn('Firebase Realtime Database is not initialized. Presence tracking will not work.');
    }
  }

  async initializePresence(userId: string, projectId: string, userName?: string): Promise<void> {
    if (!this.isEnabled || !database) return;

    try {
      this.currentUserId = userId;
      this.currentProjectId = projectId;

      this.presenceRef = ref(database, `presence/${projectId}/${userId}`);
      
      const userPresence: UserPresence = {
        userId,
        userName,
        projectId,
        status: 'online',
        lastSeen: Date.now()
      };

      await set(this.presenceRef, userPresence);

      const disconnectRef = onDisconnect(this.presenceRef);
      await disconnectRef.set({
        ...userPresence,
        status: 'offline',
        lastSeen: serverTimestamp()
      });

      console.log('Presence initialized for user:', userId, 'in project:', projectId);
    } catch (error) {
      console.error('Failed to initialize presence:', error);
    }
  }

  async updateActivity(activeComponent: string): Promise<void> {
    if (!this.isEnabled || !database || !this.presenceRef || !this.currentUserId || !this.currentProjectId) return;

    try {
      await set(this.presenceRef, {
        userId: this.currentUserId,
        projectId: this.currentProjectId,
        status: 'online',
        lastSeen: Date.now(),
        activeComponent
      });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  subscribeToProjectPresence(projectId: string, callback: (users: Record<string, UserPresence>) => void): () => void {
    if (!this.isEnabled || !database) {
      return () => {};
    }

    const projectPresenceRef = ref(database, `presence/${projectId}`);
    const listenerId = `project_${projectId}`;

    const unsubscribe = onValue(projectPresenceRef, (snapshot) => {
      const users = snapshot.val() || {};
      callback(users);
    });

    this.listeners[listenerId] = unsubscribe;

    // Return unsubscribe function
    return () => {
      if (this.listeners[listenerId]) {
        this.listeners[listenerId]();
        delete this.listeners[listenerId];
      }
    };
  }

  async getCurrentOnlineUsers(projectId: string): Promise<UserPresence[]> {
    if (!this.isEnabled || !database) return [];

    try {
      const projectPresenceRef = ref(database, `presence/${projectId}`);
      const snapshot = await get(projectPresenceRef);
      const users = snapshot.val() || {};

      return Object.values(users).filter((user: any) => user.status === 'online') as UserPresence[];
    } catch (error) {
      console.error('Failed to get online users:', error);
      return [];
    }
  }

  async startCollaborationSession(projectId: string): Promise<string | null> {
    if (!this.isEnabled || !database || !this.currentUserId) return null;

    try {
      const sessionsRef = ref(database, `collaboration_sessions/${projectId}`);
      const newSessionRef = push(sessionsRef);
      
      const session: CollaborationSession = {
        sessionId: newSessionRef.key!,
        projectId,
        users: {},
        startTime: Date.now(),
        lastActivity: Date.now()
      };

      await set(newSessionRef, session);
      
      console.log('Collaboration session started:', session.sessionId);
      return session.sessionId;
    } catch (error) {
      console.error('Failed to start collaboration session:', error);
      return null;
    }
  }

  async joinCollaborationSession(sessionId: string, projectId: string): Promise<void> {
    if (!this.isEnabled || !database || !this.currentUserId) return;

    try {
      const sessionRef = ref(database, `collaboration_sessions/${projectId}/${sessionId}/users/${this.currentUserId}`);
      
      const userPresence: UserPresence = {
        userId: this.currentUserId,
        projectId,
        status: 'online',
        lastSeen: Date.now()
      };

      await set(sessionRef, userPresence);
      
      // Update session last activity
      const lastActivityRef = ref(database, `collaboration_sessions/${projectId}/${sessionId}/lastActivity`);
      await set(lastActivityRef, Date.now());

      console.log('Joined collaboration session:', sessionId);
    } catch (error) {
      console.error('Failed to join collaboration session:', error);
    }
  }

  subscribeToCollaborationSession(sessionId: string, projectId: string, callback: (session: CollaborationSession | null) => void): () => void {
    if (!this.isEnabled || !database) {
      return () => {};
    }

    const sessionRef = ref(database, `collaboration_sessions/${projectId}/${sessionId}`);
    const listenerId = `session_${sessionId}`;

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const session = snapshot.val();
      callback(session);
    });

    this.listeners[listenerId] = unsubscribe;

    return () => {
      if (this.listeners[listenerId]) {
        this.listeners[listenerId]();
        delete this.listeners[listenerId];
      }
    };
  }
  
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isEnabled || !database) {
      return {
        success: false,
        message: 'Realtime Database is not initialized'
      };
    }

    try {
      const testRef = ref(database, 'connection_test');
      const testData = {
        timestamp: Date.now(),
        test: 'Firebase Realtime Database connection test'
      };

      // Write test data
      await set(testRef, testData);

      // Read test data
      const snapshot = await get(testRef);
      const readData = snapshot.val();

      if (readData && readData.test === testData.test) {
        return {
          success: true,
          message: 'Realtime Database connection successful'
        };
      } else {
        return {
          success: false,
          message: 'Data write/read mismatch'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Clean up presence when user leaves
   */
  async cleanup(): Promise<void> {
    if (!this.isEnabled || !database) return;

    try {
      // Mark user as offline
      if (this.presenceRef && this.currentUserId && this.currentProjectId) {
        await set(this.presenceRef, {
          userId: this.currentUserId,
          projectId: this.currentProjectId,
          status: 'offline',
          lastSeen: Date.now()
        });
      }

      // Clean up all listeners
      Object.values(this.listeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.listeners = {};

      // Reset state
      this.currentUserId = null;
      this.currentProjectId = null;
      this.presenceRef = null;

      console.log('Presence service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup presence:', error);
    }
  }

  /**
   * Get current user and project
   */
  getCurrentState(): { userId: string | null; projectId: string | null } {
    return {
      userId: this.currentUserId,
      projectId: this.currentProjectId
    };
  }
}

// Export singleton instance
export const presenceService = new PresenceService();

// Helper hook for React components
export const usePresence = () => {
  return {
    initializePresence: (userId: string, projectId: string, userName?: string) => 
      presenceService.initializePresence(userId, projectId, userName),
    updateActivity: (activeComponent: string) => 
      presenceService.updateActivity(activeComponent),
    subscribeToProjectPresence: (projectId: string, callback: (users: Record<string, UserPresence>) => void) =>
      presenceService.subscribeToProjectPresence(projectId, callback),
    getCurrentOnlineUsers: (projectId: string) => 
      presenceService.getCurrentOnlineUsers(projectId),
    startCollaborationSession: (projectId: string) => 
      presenceService.startCollaborationSession(projectId),
    joinCollaborationSession: (sessionId: string, projectId: string) => 
      presenceService.joinCollaborationSession(sessionId, projectId),
    subscribeToCollaborationSession: (sessionId: string, projectId: string, callback: (session: CollaborationSession | null) => void) =>
      presenceService.subscribeToCollaborationSession(sessionId, projectId, callback),
    testConnection: () => 
      presenceService.testConnection(),
    cleanup: () => 
      presenceService.cleanup(),
    getCurrentState: () => 
      presenceService.getCurrentState()
  };
};
