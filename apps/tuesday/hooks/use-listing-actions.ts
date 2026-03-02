import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as expoFetch } from "expo/fetch";
import { api } from "../lib/api/client";
import { BASE_URL } from "../lib/api/constants";
import { queryKeys } from "./query-keys";
import type {
  Comment,
  CommentTag,
  CreateCommentPayload,
  LikeProfile,
  ScheduleShowingResponse,
  ShareLinkResponse,
  ShareType,
} from "../types/listing-actions";
import type { Listing } from "../types/listing";

// ─── Share Link ──────────────────────────────────────────────────────

const shareLinkCache = new Map<string, string>();

export function useShareLink(profileUid: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(
    async (listingUid: string): Promise<string> => {
      const cached = shareLinkCache.get(listingUid);
      if (cached) return cached;

      setIsGenerating(true);
      try {
        const res = await api.request<string>("shares/create", {
          method: "POST",
          body: { profileUID: profileUid, listingUID: listingUid },
          responseKey: "message",
        });
        shareLinkCache.set(listingUid, res);
        return res;
      } finally {
        setIsGenerating(false);
      }
    },
    [profileUid],
  );

  return { generate, isGenerating };
}

// ─── AI Share Text (SSE) ─────────────────────────────────────────────

export function useAIShareText() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (params: {
      profileUID: string;
      listingUID: string;
      playlistUID?: string | null;
      message?: string | null;
      transcript?: string | null;
      type: ShareType;
    }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setText("");

      const url = `${BASE_URL}/shares/message/AI/stream`;
      const body = {
        profileUID: params.profileUID,
        listingUID: params.listingUID,
        playlistUID: params.playlistUID ?? null,
        message: params.message ?? null,
        transcript: params.transcript ?? null,
        type: params.type,
      };

      try {
        const response = await expoFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          setText("Failed to generate message");
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "chunk" && data.content) {
                setText((prev) => prev + data.content);
              }
            } catch {
              // Ignore malformed chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setText("Failed to generate message");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { text, setText, isLoading, generate, cancel };
}

// ─── Schedule Showing ────────────────────────────────────────────────

export function useScheduleShowing() {
  return useMutation({
    mutationFn: async ({
      profileUid,
      listingUid,
    }: {
      profileUid: string;
      listingUid: string;
    }) =>
      api.request<ScheduleShowingResponse>("showing/schedule", {
        method: "POST",
        body: { profileUID: profileUid, listingUID: listingUid },
        responseKey: null,
      }),
  });
}

// ─── Comments ────────────────────────────────────────────────────────

export function useComments(listingUid: string, profileUid: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.comments(listingUid),
    queryFn: () =>
      api.request<Comment[]>("comments/all", {
        query: { profileUID: profileUid, listingUID: listingUid },
        responseKey: "message",
      }),
    enabled: enabled && !!listingUid && !!profileUid,
  });
}

let tempCommentId = 0;

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload) =>
      api.request<string>("comments", {
        method: "POST",
        body: payload as unknown as Record<string, unknown>,
        responseKey: "message",
      }),

    // Optimistic insertion with negative ID
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.comments(payload.listingUID),
      });

      const previous = queryClient.getQueryData<Comment[]>(
        queryKeys.comments(payload.listingUID),
      );

      const tempComment: Comment = {
        id: --tempCommentId, // Negative ID = temporary
        listingUID: payload.listingUID,
        profileUID: payload.profileUID,
        profile: null,
        body: payload.comment,
        replyID: payload.replyID ?? null,
        status: payload.status,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        listingUnparsedAddress: null,
        listingPreferredPhoto: null,
        officeID: null,
        officeUID: null,
        officeName: null,
      };

      queryClient.setQueryData<Comment[]>(
        queryKeys.comments(payload.listingUID),
        (old) => (old ? [tempComment, ...old] : [tempComment]),
      );

      return { previous };
    },

    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.comments(variables.listingUID),
          context.previous,
        );
      }
    },

    onSuccess: (_data, variables) => {
      // Replace temp comment with real data from server
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.listingUID),
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      commentId,
      listingUid,
    }: {
      profileUid: string;
      commentId: number;
      listingUid: string;
    }) =>
      api.request<string>("comments/delete", {
        method: "DELETE",
        query: { profileUID: profileUid, commentID: commentId },
        responseKey: "message",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.listingUid),
      });
    },
  });
}

export function useMentionSearch() {
  const [results, setResults] = useState<CommentTag[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((profileUid: string, text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const tags = await api.request<CommentTag[]>("comments/tags", {
          method: "POST",
          body: { profileUID: profileUid, text: text.trim() },
          responseKey: "message",
        });
        setResults(tags);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setResults([]);
  }, []);

  return { results, isSearching, search, clear };
}

// ─── Like (optimistic) ──────────────────────────────────────────────

export function useOptimisticLike(listingUid: string, profileUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isLike }: { isLike: boolean }) =>
      api.request<string>("likes", {
        method: "POST",
        query: {
          profileUID: profileUid,
          listingUID: listingUid,
          like: isLike,
        },
        responseKey: "message",
      }),

    onMutate: async ({ isLike }) => {
      // Cancel any in-flight queries that might overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.listing(listingUid),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.feed(profileUid),
      });

      // Snapshot previous states for rollback
      const previousListing = queryClient.getQueryData<Listing>(
        queryKeys.listing(listingUid),
      );
      const previousFeed = queryClient.getQueryData(
        queryKeys.feed(profileUid),
      );

      // Optimistically update single listing detail cache
      queryClient.setQueryData<Listing>(
        queryKeys.listing(listingUid),
        (old) =>
          old
            ? {
                ...old,
                isLiked: isLike,
                LikesCount: (old.LikesCount ?? 0) + (isLike ? 1 : -1),
              }
            : old,
      );

      // Optimistically update feed cache (infinite query pages)
      queryClient.setQueriesData<{ pages: { listings: Listing[] }[]; pageParams: unknown[] }>(
        { queryKey: queryKeys.feed(profileUid) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              listings: page.listings.map((l) =>
                l.UID === listingUid
                  ? {
                      ...l,
                      isLiked: isLike,
                      LikesCount: (l.LikesCount ?? 0) + (isLike ? 1 : -1),
                    }
                  : l,
              ),
            })),
          };
        },
      );

      return { previousListing, previousFeed };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousListing) {
        queryClient.setQueryData(
          queryKeys.listing(listingUid),
          context.previousListing,
        );
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(
          queryKeys.feed(profileUid),
          context.previousFeed,
        );
      }
    },

    onSettled: () => {
      // Reconcile with server truth after mutation completes
      queryClient.invalidateQueries({
        queryKey: queryKeys.listing(listingUid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed(profileUid),
      });
    },
  });
}

// ─── Listing Likes List ──────────────────────────────────────────────

export function useListingLikes(listingUid: string, profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.likes(listingUid),
    queryFn: () =>
      api.request<LikeProfile[]>("likes/all", {
        query: { profileUID: profileUid, listingUID: listingUid },
        responseKey: "message",
      }),
    enabled: enabled && !!listingUid && !!profileUid,
  });
}

// ─── Smart Share Daily Limit ────────────────────────────────────────

const SMART_SHARE_USED_KEY = "smartShareUsedListingUid";
const SMART_SHARE_DATE_KEY = "smartShareLastDate";

export function useSmartShareLimit(listingUid: string) {
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check limit on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lastUid, lastDate] = await Promise.all([
          AsyncStorage.getItem(SMART_SHARE_USED_KEY),
          AsyncStorage.getItem(SMART_SHARE_DATE_KEY),
        ]);

        if (!cancelled) {
          const today = new Date().toISOString().split("T")[0];
          // If same day and different listing → limit reached
          if (lastDate === today && lastUid && lastUid !== listingUid) {
            setIsLimitReached(true);
          } else {
            setIsLimitReached(false);
          }
          setIsChecking(false);
        }
      } catch {
        if (!cancelled) setIsChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [listingUid]);

  // Record a usage
  const recordUsage = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    await Promise.all([
      AsyncStorage.setItem(SMART_SHARE_USED_KEY, listingUid),
      AsyncStorage.setItem(SMART_SHARE_DATE_KEY, today),
    ]);
  }, [listingUid]);

  return { isLimitReached, isChecking, recordUsage };
}
