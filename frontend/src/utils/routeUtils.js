/**
 * Utility functions for handling React Router routes and parameters
 */

/**
 * Safely extracts route parameters from useParams() hook result
 * Compatible with React Router v7
 * 
 * @param {Object} params - The result of useParams() hook
 * @param {string} paramName - The name of the parameter to extract
 * @param {*} defaultValue - Default value if parameter is not found
 * @returns {*} The parameter value or default value
 */
export const getRouteParam = (params, paramName, defaultValue = null) => {
  if (!params) return defaultValue;
  return params[paramName] || defaultValue;
};