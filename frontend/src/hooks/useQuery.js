import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading, error, and retry functionality
 * Similar to react-query's useQuery hook but simpler
 */
export const useQuery = (key, queryFn, options = {}) => {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchInterval = null,
    onError = null,
    onSuccess = null,
    retryCount = 0,
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [retry, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await queryFn();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error(`Query ${key} failed:`, err);
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      // Auto retry if retryCount is specified
      if (retry < retryCount) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * Math.pow(2, retry)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, queryFn, enabled, onSuccess, onError, retry, retryCount]);

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData();
    }
  }, [fetchData, enabled, refetchOnMount, retry]);

  // Interval refetch
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, enabled, refetchInterval]);

  // Manual refetch function
  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isError: !!error,
    isSuccess: !isLoading && !error && data !== null,
  };
};

/**
 * Hook specifically for vendor search with caching
 */
export const useVendorSearch = (searchParams, options = {}) => {
  // Create a stable key for caching
  const queryKey = `vendors-${JSON.stringify(searchParams)}`;
  
  const queryFn = async () => {
    const { vendorsAPI } = await import('../services/api');
    
    // Transform search params to match backend API
    const apiParams = {};
    
    if (searchParams.vendorType && searchParams.vendorType !== '') {
      apiParams.category = searchParams.vendorType;
    }
    
    if (searchParams.location && searchParams.location !== '') {
      apiParams.location = searchParams.location;
    }
    
    if (searchParams.rating && searchParams.rating !== 'Any' && searchParams.rating !== '') {
      const ratingMap = {
        'Excellent': 9.0,
        'Very good': 8.0,
        'Good': 7.0
      };
      apiParams.min_rating = ratingMap[searchParams.rating] || 0;
    }
    
    if (searchParams.featured) {
      apiParams.featured_only = true;
    }
    
    // Set default limit
    apiParams.limit = options.limit || 20;
    apiParams.skip = options.skip || 0;
    
    const response = await vendorsAPI.search(apiParams);
    return response.data || []; // Ensure we always return an array
  };
  
  return useQuery(queryKey, queryFn, {
    enabled: true,
    retryCount: 1,
    ...options
  });
};

/**
 * Hook for fetching a single vendor by ID
 */
export const useVendor = (vendorId, options = {}) => {
  const queryKey = `vendor-${vendorId}`;
  
  const queryFn = async () => {
    const { vendorsAPI } = await import('../services/api');
    const response = await vendorsAPI.getById(vendorId);
    return response.data;
  };
  
  return useQuery(queryKey, queryFn, {
    enabled: !!vendorId,
    retryCount: 1,
    ...options
  });
};

export default useQuery;