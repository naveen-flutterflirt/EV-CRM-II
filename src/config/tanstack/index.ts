import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes TTL
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      refetchOnWindowFocus: false, // Prevent refetching on screen focus/click
      refetchOnMount: false, // Prevent refetching on component remount if cached
      refetchOnReconnect: false, // Prevent refetching on reconnect if cached
      retry: 1,
    },
  },
});

export default queryClient;
