/**
 * 📳 Haptic Feedback Utility
 * Provides tactile feedback on mobile devices
 */

const hapticPatterns = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 5, 10],
  error: [30, 10, 30],
  warning: [20, 10, 20],
  click: [5],
  double: [10, 50, 10]
};

/**
 * Trigger haptic feedback with fallback to visual animation
 * @param {string} type - Pattern type (light, medium, heavy, success, error, warning, click, double)
 * @param {HTMLElement} element - Optional element to animate as visual fallback
 */
export function triggerHaptic(type = 'light', element = null) {
  // Try native haptic feedback first
  if (navigator.vibrate) {
    navigator.vibrate(hapticPatterns[type] || hapticPatterns.light);
  }
  
  // Visual fallback animation
  if (element) {
    element.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' }
    ], {
      duration: 200,
      easing: 'ease-out'
    });
  }
}

/**
 * Trigger haptic on button/action click
 * @param {Event} event - Click event
 * @param {string} type - Haptic pattern type
 */
export function hapticOnClick(event, type = 'click') {
  const element = event.currentTarget;
  triggerHaptic(type, element);
}

/**
 * Check if device supports haptic feedback
 * @returns {boolean}
 */
export function supportsHaptic() {
  return 'vibrate' in navigator;
}

export default triggerHaptic;
