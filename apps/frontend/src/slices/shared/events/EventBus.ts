// Event Bus - Inter-Slice Communication System
// Replaces direct cross-slice database calls with proper event-driven architecture

import { SliceEventType } from '../types';

type EventHandler<T extends SliceEventType = SliceEventType> = (event: T) => Promise<void> | void;

interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * EventBus enables atomic slices to communicate without direct dependencies
 * Events are processed asynchronously to maintain slice independence
 */
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private static instance: EventBus | null = null;

  private constructor() {}

  // Singleton pattern to ensure consistent event handling across slices
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit an event to all registered handlers
   * Errors in individual handlers don't affect other handlers
   */
  async emit<T extends SliceEventType>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    // Execute all handlers concurrently for performance
    const handlerPromises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        // Log error but don't fail the entire event emission
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });

    // Wait for all handlers to complete
    await Promise.allSettled(handlerPromises);
  }

  /**
   * Subscribe to events of a specific type
   * Returns unsubscribe function for cleanup
   */
  on<T extends SliceEventType>(
    eventType: T['type'], 
    handler: EventHandler<T>
  ): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler as EventHandler);

    return {
      unsubscribe: () => {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
          const index = handlers.indexOf(handler as EventHandler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }
    };
  }

  /**
   * Subscribe to multiple event types with the same handler
   */
  onMultiple<T extends SliceEventType>(
    eventTypes: T['type'][], 
    handler: EventHandler<T>
  ): EventSubscription {
    const subscriptions = eventTypes.map(type => this.on(type, handler));

    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      }
    };
  }

  /**
   * Remove all handlers for a specific event type
   */
  removeAllListeners(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Clear all event handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get number of handlers for debugging
   */
  getHandlerCount(eventType?: string): number {
    if (eventType) {
      return this.handlers.get(eventType)?.length || 0;
    }
    
    let total = 0;
    for (const handlers of this.handlers.values()) {
      total += handlers.length;
    }
    return total;
  }
}

// Export singleton instance for consistent usage
export const eventBus = EventBus.getInstance();

// Helper functions for common event patterns
export const EventHelpers = {
  /**
   * Create a transaction event with proper timestamp and validation
   */
  createTransactionEvent<T extends SliceEventType>(
    type: T['type'],
    familyId: string,
    userId: string,
    data: T['data']
  ): T {
    return {
      type,
      familyId,
      userId,
      timestamp: Date.now(),
      data
    } as T;
  },

  /**
   * Emit transaction created event
   */
  async emitTransactionCreated(
    familyId: string,
    userId: string,
    transaction: any
  ): Promise<void> {
    const event = EventHelpers.createTransactionEvent(
      'transaction.created',
      familyId,
      userId,
      transaction
    );
    await eventBus.emit(event as any);
  },

  /**
   * Emit budget update event
   */
  async emitBudgetUpdated(
    familyId: string,
    userId: string,
    updateData: {
      categoryId: string;
      category: any;
      oldSpent: number;
      newSpent: number;
    }
  ): Promise<void> {
    const event = EventHelpers.createTransactionEvent(
      'budget.updated',
      familyId,
      userId,
      updateData
    );
    await eventBus.emit(event as any);
  },

  /**
   * Emit daily budget invalidation event
   */
  async emitDailyBudgetInvalidated(
    familyId: string,
    userId: string,
    date: string
  ): Promise<void> {
    const event = EventHelpers.createTransactionEvent(
      'dailyBudget.invalidated',
      familyId,
      userId,
      { date }
    );
    await eventBus.emit(event as any);
  }
};