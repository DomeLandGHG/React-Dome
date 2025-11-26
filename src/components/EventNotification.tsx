import React, { useEffect, useState } from 'react';
import { EVENT_CONFIG, type ElementalEventType } from '../types/ElementalEvent';
import '../styles/EventNotification.css';

interface EventNotificationProps {
  eventId: ElementalEventType | null;
  eventEndTime: number | null;
}

export const EventNotification: React.FC<EventNotificationProps> = ({ eventId, eventEndTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!eventEndTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, eventEndTime - now);
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [eventEndTime]);

  if (!eventId) return null;

  const event = EVENT_CONFIG.find(e => e.id === eventId);
  if (!event) return null;

  return (
    <div className="event-notification">
      <div className="event-content">
        <div className="event-icon">{event.icon}</div>
        <div className="event-info">
          <div className="event-name">{event.name}</div>
          <div className="event-description">{event.description}</div>
        </div>
        <div className="event-timer">
          <div className="timer-label">Endet in</div>
          <div className="timer-value">{timeRemaining}</div>
        </div>
      </div>
      <div className="event-progress">
        <div 
          className="event-progress-bar" 
          style={{
            width: `${eventEndTime ? Math.max(0, (1 - (eventEndTime - Date.now()) / event.duration) * 100) : 0}%`
          }}
        />
      </div>
    </div>
  );
};
