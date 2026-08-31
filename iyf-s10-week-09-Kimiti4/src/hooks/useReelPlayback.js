import { useState, useCallback, useRef, useEffect } from 'react';
import { reelsAPI } from '../services/reelApi';
import { trackView } from '../contracts/socialEventContract';

/**
 * Controls video playback for a single reel.
 * Handles play/pause, mute, progress, and completion tracking.
 */
export function useReelPlayback(reelId, videoRef) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const viewRecorded = useRef(false);
  const completionRecorded = useRef(false);
  const progressInterval = useRef(null);

  // Record view when video starts playing
  useEffect(() => {
    if (isPlaying && !viewRecorded.current && reelId) {
      viewRecorded.current = true;
      trackView('reel', reelId);
      reelsAPI.recordView(reelId).catch(() => {});
    }
  }, [isPlaying, reelId]);

  const updateProgress = useCallback(() => {
    const video = videoRef?.current;
    if (!video || video.duration) {
      if (video?.duration) {
        setDuration(video.duration);
        setProgress(video.currentTime / video.duration);

        // Record completion at 90%
        if (
          video.currentTime / video.duration >= 0.9 &&
          !completionRecorded.current &&
          reelId
        ) {
          completionRecorded.current = true;
          reelsAPI.recordCompletion(reelId).catch(() => {});
        }
      }
    }
  }, [videoRef, reelId]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(updateProgress, 250);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, updateProgress]);

  const play = useCallback(() => {
    const video = videoRef?.current;
    if (video) {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [videoRef]);

  const pause = useCallback(() => {
    const video = videoRef?.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    const video = videoRef?.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  }, [videoRef]);

  const seekTo = useCallback((fraction) => {
    const video = videoRef?.current;
    if (video && video.duration) {
      video.currentTime = fraction * video.duration;
      setProgress(fraction);
    }
  }, [videoRef]);

  const onLoadedData = useCallback(() => {
    const video = videoRef?.current;
    if (video) {
      setDuration(video.duration);
      setIsLoaded(true);
    }
  }, [videoRef]);

  // Reset when reel changes
  useEffect(() => {
    viewRecorded.current = false;
    completionRecorded.current = false;
    setProgress(0);
    setIsPlaying(false);
    setIsLoaded(false);
  }, [reelId]);

  return {
    isPlaying,
    isMuted,
    progress,
    duration,
    isLoaded,
    play,
    pause,
    togglePlay,
    toggleMute,
    seekTo,
    onLoadedData,
  };
}
