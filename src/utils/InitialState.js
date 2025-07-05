export const getInitialState = (key, defaultState) => {
    try {
        const stored = localStorage.getItem(key);
        const parsedState = stored ? JSON.parse(stored) : defaultState;
        if (Array.isArray(parsedState)) {
            return parsedState;
        } else {
            console.warn(`Local storage key "${key}" contained non-array data. Using default state.`);
            return defaultState;
        }
    } catch (err) {
        console.error(`Error retrieving state for key "${key}":`, err);
        return defaultState;
    }
}
