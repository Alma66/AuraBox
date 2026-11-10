const EVENT_NAME = 'aurabox:cart-changed';

export const notifyCartChanged = (): void => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const onCartChanged = (listener: () => void): (() => void) => {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};