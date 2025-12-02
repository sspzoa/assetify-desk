import { useQuery } from "@tanstack/react-query";

interface SessionInfo {
  expiresAt: number;
  createdAt: number;
}

export const useSession = (sessionId: string) => {
  return useQuery<SessionInfo>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await fetch("/api/session/query", {
        headers: {
          "X-Session-Id": sessionId,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    refetchInterval: 1000,
    retry: false,
  });
};
