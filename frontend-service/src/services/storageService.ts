/**
 * Base storage service that handles localStorage interactions
 * with error handling and type safety
 */

// Check if localStorage is available
const isStorageAvailable = () => {
	try {
		const test = "__storage_test__";
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
};

/**
 * Get a value from localStorage with proper type conversion
 * @param key The key to retrieve
 * @param defaultValue Default value if key doesn't exist or storage is unavailable
 * @returns The stored value or defaultValue
 */
export const getItem = <T>(key: string, defaultValue: T): T => {
	if (!isStorageAvailable()) {
		console.warn("localStorage is not available");
		return defaultValue;
	}

	try {
		const item = localStorage.getItem(key);
		if (item === null) {
			return defaultValue;
		}

		// Try to parse as JSON, fallback to string if failed
		try {
			return JSON.parse(item) as T;
		} catch {
			// If it's not valid JSON, return as is (string)
			return item as unknown as T;
		}
	} catch (error) {
		console.error(`Error getting item from localStorage: ${key}`, error);
		return defaultValue;
	}
};

/**
 * Set a value in localStorage with proper serialization
 * @param key The key to store under
 * @param value The value to store
 * @returns boolean success indicator
 */
export const setItem = <T>(key: string, value: T): boolean => {
	if (!isStorageAvailable()) {
		console.warn("localStorage is not available");
		return false;
	}

	try {
		// Convert value to string if it's not already
		const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
		localStorage.setItem(key, valueToStore);
		return true;
	} catch (error) {
		console.error(`Error setting item in localStorage: ${key}`, error);
		return false;
	}
};

/**
 * Remove a value from localStorage
 * @param key The key to remove
 * @returns boolean success indicator
 */
export const removeItem = (key: string): boolean => {
	if (!isStorageAvailable()) {
		console.warn("localStorage is not available");
		return false;
	}

	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error(`Error removing item from localStorage: ${key}`, error);
		return false;
	}
};

/**
 * Clear all values from localStorage
 * @returns boolean success indicator
 */
export const clearAll = (): boolean => {
	if (!isStorageAvailable()) {
		console.warn("localStorage is not available");
		return false;
	}

	try {
		localStorage.clear();
		return true;
	} catch (error) {
		console.error("Error clearing localStorage", error);
		return false;
	}
};