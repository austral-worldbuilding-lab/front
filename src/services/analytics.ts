/**
 * Analytics Service - Firebase Analytics Integration
 * 
 * Rastrea eventos de uso de la aplicación: interacciones de IA, colaboración, 
 * navegación y engagement de usuarios. Envía métricas a Firebase Analytics
 * para análisis de comportamiento, optimización de features y business intelligence.
 */

import { analytics } from '@/config/firebase';
import { logEvent, type Analytics } from 'firebase/analytics';

export interface AiRequestEventClient {
  request_id: string;
  user_id: string;
  project_id: string;
  mandala_id?: string;
  request_type: 'generate_postits' | 'generate_questions' | 'generate_summary';
  dimensions_count?: number;
  scales_count?: number;
  tags_count?: number;
  selected_files_count?: number;
}

export interface AiResponseEventClient {
  request_id: string;
  user_id: string;
  project_id: string;
  response_type: 'postits' | 'questions' | 'summary';
  success: boolean;
  error_type?: string;
  latency_ms: number;
  results_count?: number;
}

export interface CollaborationEventClient {
  event_type: 'user_join' | 'user_leave' | 'invite_sent' | 'invite_accepted' | 'role_changed';
  user_id: string;
  project_id: string;
  organization_id: string;
  role?: string;
  inviter_id?: string;
  session_duration_ms?: number;
}

export interface MandalaInteractionEventClient {
  event_type: 'mandala_create' | 'mandala_edit' | 'postit_create' | 'postit_edit' | 'postit_delete' | 'character_edit';
  user_id: string;
  project_id: string;
  mandala_id: string;
  mandala_type: 'CHARACTER' | 'OVERLAP' | 'OVERLAP_SUMMARY';
  object_id?: string;
  collaboration_session_active: boolean;
}

export interface UserEngagementEvent {
  event_type: 'page_view' | 'session_start' | 'session_end' | 'feature_usage';
  user_id: string;
  page_name?: string;
  feature_name?: string;
  session_duration_ms?: number;
  organization_id?: string;
  project_id?: string;
}

export interface PostitConvertedEvent {
  request_id: string;
  user_id: string;
  project_id: string;
  mandala_id: string;
  candidate_index: number;
  dimension?: string;
  scale?: string;
  object_id?: string;
}

class AnalyticsService {
  private analytics: Analytics | null;
  private isEnabled: boolean = false;
  private sessionStartTime: number = Date.now();
  private currentUserId: string | null = null;

  constructor() {
    this.analytics = analytics;
    this.isEnabled = !!this.analytics;
    
    if (!this.isEnabled) {
      console.warn('Firebase Analytics is not initialized. Analytics events will not be tracked.');
    }
  }

  /**
   * Initialize analytics with user information
   */
  initialize(userId: string, userProperties?: Record<string, any>): void {
    if (!this.isEnabled || !this.analytics) return;

    this.currentUserId = userId;
    
    try {
      if (userProperties) {
        Object.entries(userProperties).forEach(([key, value]) => {
          logEvent(this.analytics!, 'set_user_properties', {
            [key]: value
          });
        });
      }

      this.trackUserEngagement({
        event_type: 'session_start',
        user_id: userId
      });

      console.log('Analytics initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  trackAiRequest(event: AiRequestEventClient): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      logEvent(this.analytics, 'ai_request', {
        request_id: event.request_id,
        user_id: event.user_id,
        project_id: event.project_id,
        mandala_id: event.mandala_id || null,
        request_type: event.request_type,
        dimensions_count: event.dimensions_count || 0,
        scales_count: event.scales_count || 0,
        tags_count: event.tags_count || 0,
        selected_files_count: event.selected_files_count || 0,
        timestamp: Date.now()
      });

      console.log('AI request tracked:', event.request_id);
    } catch (error) {
      console.error('Failed to track AI request:', error);
    }
  }

  trackAiResponse(event: AiResponseEventClient): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      logEvent(this.analytics, 'ai_response', {
        request_id: event.request_id,
        user_id: event.user_id,
        project_id: event.project_id,
        response_type: event.response_type,
        success: event.success,
        error_type: event.error_type || null,
        latency_ms: event.latency_ms,
        results_count: event.results_count || 0,
        timestamp: Date.now()
      });

      console.log('AI response tracked:', event.request_id, 'Success:', event.success);
    } catch (error) {
      console.error('Failed to track AI response:', error);
    }
  }

  trackCollaboration(event: CollaborationEventClient): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      logEvent(this.analytics, 'collab_join', {
        event_type: event.event_type,
        user_id: event.user_id,
        project_id: event.project_id,
        organization_id: event.organization_id,
        role: event.role || null,
        inviter_id: event.inviter_id || null,
        session_duration_ms: event.session_duration_ms || 0,
        timestamp: Date.now()
      });

      console.log('Collaboration event tracked:', event.event_type);
    } catch (error) {
      console.error('Failed to track collaboration event:', error);
    }
  }

  trackMandalaInteraction(event: MandalaInteractionEventClient): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      logEvent(this.analytics, 'mandala_interaction', {
        event_type: event.event_type,
        user_id: event.user_id,
        project_id: event.project_id,
        mandala_id: event.mandala_id,
        mandala_type: event.mandala_type,
        object_id: event.object_id || null,
        collaboration_session_active: event.collaboration_session_active,
        timestamp: Date.now()
      });

      console.log('Mandala interaction tracked:', event.event_type);
    } catch (error) {
      console.error('Failed to track mandala interaction:', error);
    }
  }

  trackUserEngagement(event: UserEngagementEvent): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      if (event.event_type === 'page_view') {
        logEvent(this.analytics, 'page_view', {
          event_type: event.event_type,
          user_id: event.user_id,
          page_name: event.page_name || null,
          timestamp: Date.now()
        });
      } else {
        logEvent(this.analytics, 'custom_event', {
          event_type: event.event_type,
          user_id: event.user_id,
          feature_name: event.feature_name || null,
          session_duration_ms: event.session_duration_ms || 0,
          organization_id: event.organization_id || null,
          project_id: event.project_id || null,
          timestamp: Date.now()
        });
      }

      console.log('User engagement tracked:', event.event_type);
    } catch (error) {
      console.error('Failed to track user engagement:', error);
    }
  }

  trackPageView(pageName: string, userId?: string, additionalParams?: Record<string, any>): void {
    if (!this.isEnabled || !this.analytics) return;

    const actualUserId = userId || this.currentUserId;
    if (!actualUserId) {
      console.warn('Cannot track page view: no user ID available');
      return;
    }

    this.trackUserEngagement({
      event_type: 'page_view',
      user_id: actualUserId,
      page_name: pageName,
      ...additionalParams
    });
  }

  trackFeatureUsage(featureName: string, userId?: string, additionalParams?: Record<string, any>): void {
    if (!this.isEnabled || !this.analytics) return;

    const actualUserId = userId || this.currentUserId;
    if (!actualUserId) {
      console.warn('Cannot track feature usage: no user ID available');
      return;
    }

    this.trackUserEngagement({
      event_type: 'feature_usage',
      user_id: actualUserId,
      feature_name: featureName,
      ...additionalParams
    });
  }

  trackSessionEnd(): void {
    if (!this.isEnabled || !this.analytics || !this.currentUserId) return;

    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.trackUserEngagement({
      event_type: 'session_end',
      user_id: this.currentUserId,
      session_duration_ms: sessionDuration
    });
  }

  setUserProperties(properties: Record<string, string | number | boolean>): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      Object.entries(properties).forEach(([key, value]) => {
        logEvent(this.analytics!, 'set_user_properties', {
          [key]: value
        });
      });

      console.log('User properties set:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  createTimer(): () => number {
    const startTime = Date.now();
    return () => Date.now() - startTime;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  trackPostitConverted(converted: PostitConvertedEvent): void {
  if (!this.isEnabled || !this.analytics) return;
  logEvent(this.analytics, 'postit_converted', {
    request_id: converted.request_id,
    user_id: converted.user_id,
    project_id: converted.project_id,
    mandala_id: converted.mandala_id,
    candidate_index: converted.candidate_index,
    dimension: converted.dimension ?? null,
    scale: converted.scale ?? null,
    object_id: converted.object_id ?? null,
    timestamp: Date.now(),
  });
}
}

export const analyticsService = new AnalyticsService();

export const useAnalytics = () => {
  return {
    trackAiRequest: (event: AiRequestEventClient) => analyticsService.trackAiRequest(event),
    trackAiResponse: (event: AiResponseEventClient) => analyticsService.trackAiResponse(event),
    trackCollaboration: (event: CollaborationEventClient) => analyticsService.trackCollaboration(event),
    trackMandalaInteraction: (event: MandalaInteractionEventClient) => analyticsService.trackMandalaInteraction(event),
    trackPageView: (pageName: string, additionalParams?: Record<string, any>) => 
      analyticsService.trackPageView(pageName, undefined, additionalParams),
    trackFeatureUsage: (featureName: string, additionalParams?: Record<string, any>) => 
      analyticsService.trackFeatureUsage(featureName, undefined, additionalParams),
    createTimer: () => analyticsService.createTimer(),
    setUserProperties: (properties: Record<string, string | number | boolean>) => 
      analyticsService.setUserProperties(properties),
    trackPostitConverted: (e: PostitConvertedEvent) => analyticsService.trackPostitConverted(e),
  };
};
