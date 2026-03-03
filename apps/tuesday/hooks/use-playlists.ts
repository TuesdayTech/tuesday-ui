import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { FEED_PAGE_SIZE } from "../lib/api/constants";
import { queryKeys } from "./query-keys";
import type { Playlist } from "../types/playlist";
import type { Listing } from "../types/listing";
import type { ProfileSortOrder } from "../types/profile";

export function usePlaylists(profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.playlists(profileUid),
    queryFn: () =>
      api.request<Playlist[]>("playlists/all", {
        query: { profileUID: profileUid },
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: enabled && !!profileUid,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileUid }: { profileUid: string }) =>
      api.request<Playlist>("playlists", {
        method: "POST",
        body: { profileUID: profileUid },
        requiresAuth: true,
      }),
    onSuccess: (_data, { profileUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlists(profileUid),
      });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      playlistUid,
    }: {
      profileUid: string;
      playlistUid: string;
    }) =>
      api.request<void>("playlists", {
        method: "DELETE",
        body: { profileUID: profileUid, playlistUID: playlistUid },
        requiresAuth: true,
      }),
    onMutate: async ({ profileUid, playlistUid }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.playlists(profileUid),
      });
      const previous = queryClient.getQueryData<Playlist[]>(
        queryKeys.playlists(profileUid),
      );
      queryClient.setQueryData<Playlist[]>(
        queryKeys.playlists(profileUid),
        (old) => old?.filter((p) => p.UID !== playlistUid),
      );
      return { previous };
    },
    onError: (_err, { profileUid }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.playlists(profileUid),
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, { profileUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlists(profileUid),
      });
    },
  });
}

export function usePlaylist(uid: string, profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.playlist(uid),
    queryFn: () =>
      api.request<Playlist>("playlists", {
        query: { profileUID: profileUid, playlistUID: uid },
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: enabled && !!uid && !!profileUid,
  });
}

const SORT_API_VALUE: Record<ProfileSortOrder, string> = {
  recent: "Recent",
  highest: "CurrentPrice",
};

export function usePlaylistListings(
  playlistUid: string,
  profileUid: string,
  sort: ProfileSortOrder = "recent",
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.playlistListings(playlistUid, sort),
    queryFn: async ({ pageParam = 0 }) => {
      const listings = await api.request<Listing[]>("playlists/listings", {
        query: {
          profileUID: profileUid,
          playlistUID: playlistUid,
          limit: FEED_PAGE_SIZE,
          offset: pageParam as number,
          filter: SORT_API_VALUE[sort],
        },
        requiresAuth: true,
        responseKey: null,
      });

      return {
        listings: listings ?? [],
        offset: pageParam as number,
        nextOffset:
          listings && listings.length === FEED_PAGE_SIZE
            ? (pageParam as number) + FEED_PAGE_SIZE
            : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: enabled && !!playlistUid && !!profileUid,
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      playlistUid,
      filters,
    }: {
      profileUid: string;
      playlistUid: string;
      filters: Record<string, unknown>;
    }) =>
      api.request<Playlist>("playlists/update", {
        method: "PATCH",
        body: {
          profileUID: profileUid,
          playlistUID: playlistUid,
          filters,
        },
        requiresAuth: true,
      }),
    onSuccess: (_data, { profileUid, playlistUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlist(playlistUid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlists(profileUid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlistListings(playlistUid, "recent"),
      });
    },
  });
}

export function usePlaylistFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      playlistUid,
      follow,
    }: {
      profileUid: string;
      playlistUid: string;
      follow: boolean;
    }) =>
      api.request<string>(follow ? "follow" : "unfollow", {
        method: "POST",
        body: {
          profileUID: profileUid,
          playlists: [{ UID: playlistUid }],
        },
        responseKey: "message",
      }),

    onMutate: async ({ playlistUid, follow }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.playlist(playlistUid),
      });
      const previous = queryClient.getQueryData<Playlist>(
        queryKeys.playlist(playlistUid),
      );
      queryClient.setQueryData<Playlist>(
        queryKeys.playlist(playlistUid),
        (old) => (old ? { ...old, isFollowing: follow } : old),
      );
      return { previous };
    },

    onError: (_err, { playlistUid }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.playlist(playlistUid),
          context.previous,
        );
      }
    },

    onSettled: (_data, _error, { profileUid, playlistUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlist(playlistUid),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.followings(profileUid),
      });
    },
  });
}
