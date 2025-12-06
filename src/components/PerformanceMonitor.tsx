/**
 * Performance Monitor - Shows FPS and click rate in real-time
 * Toggle with Ctrl+Shift+P
 */

import React, { useState, useEffect, useRef } from 'react';

interface PerformanceStats {
  fps: number;
  clicksPerSecond: number;
  avgFrameTime: number;
  clicksProcessed: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    clicksPerSecond: 0,
    avgFrameTime: 16.67,
    clicksProcessed: 0
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor FPS
  useEffect(() => {
    if (!visible) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      // Track last 60 frames
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate average
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = 1000 / avgFrameTime;

      // Get click rate from global tracking
      const clickRate = (window as any).__clickRateMoneyBtn || [];
      const nowTimestamp = Date.now();
      const recentClicks = clickRate.filter((t: number) => nowTimestamp - t < 1000);

      setStats({
        fps: Math.round(fps),
        clicksPerSecond: recentClicks.length,
        avgFrameTime: Math.round(avgFrameTime * 10) / 10,
        clicksProcessed: 0 // TODO: Track from useGameLogic
      });

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  // Color code FPS
  const fpsColor = stats.fps >= 55 ? '#4ade80' : stats.fps >= 30 ? '#facc15' : '#f87171';
  const clickColor = stats.clicksPerSecond >= 100 ? '#f87171' : stats.clicksPerSecond >= 50 ? '#facc15' : '#4ade80';

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: 'white',
        zIndex: 10000,
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
        Performance Monitor
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>FPS:</span>
        <span style={{ color: fpsColor, fontWeight: 'bold' }}>{stats.fps}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>Frame Time:</span>
        <span>{stats.avgFrameTime}ms</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>Clicks/sec:</span>
        <span style={{ color: clickColor, fontWeight: 'bold' }}>{stats.clicksPerSecond}</span>
      </div>

      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '10px',
        opacity: 0.7
      }}>
        Press Ctrl+Shift+P to hide
      </div>
    </div>
  );
};
