export const getInitialState = (key, defaultState) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultState;
  } catch (err) {
    console.error(`Error retrieving state for key "${key}":`, err);
    return defaultState;
  }
}
