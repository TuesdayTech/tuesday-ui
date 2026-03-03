import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { XCircle, ArrowBendUpRight, Trash } from "phosphor-react-native";
import { Image } from "expo-image";
import * as ExpoClipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../hooks/use-auth";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useMentionSearch,
} from "../../hooks/use-listing-actions";
import type { Comment, CommentTag } from "../../types/listing-actions";

// ─── Relative Time ───────────────────────────────────────────────────

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "now";
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d`;
  const diffMon = Math.floor(diffDay / 30);
  if (diffMon < 12) return `${diffMon}mo`;
  return `${Math.floor(diffMon / 12)}y`;
}

// ─── Mention Highlighter ─────────────────────────────────────────────

function renderBodyWithMentions(
  body: string,
  textColor: string,
  mentionColor: string,
) {
  const parts = body.split(/(@[\w_]+)/g);
  return (
    <Text
      style={{
        fontFamily: "GeistSans",
        fontSize: 15,
        color: textColor,
        lineHeight: 22,
      }}
    >
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <Text
            key={i}
            style={{
              color: mentionColor,
              fontFamily: "GeistSans-Medium",
            }}
          >
            {part}
          </Text>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </Text>
  );
}

// ─── Comment Row ─────────────────────────────────────────────────────

interface CommentRowProps {
  comment: Comment;
  isReply?: boolean;
  isOwn: boolean;
  isTemporary: boolean;
  t: ReturnType<typeof useThemeColors>;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
}

function CommentRow({
  comment,
  isReply,
  isOwn,
  isTemporary,
  t,
  onReply,
  onDelete,
}: CommentRowProps) {
  const avatarSize = isReply ? 32 : 40;
  const profile = comment.profile;
  const initial = profile?.MemberFullName?.charAt(0) ?? "?";
  const hasAvatar = !!profile?.Media;

  // Context menu on long press
  const handleLongPress = useCallback(() => {
    if (isTemporary) return;

    const options: string[] = ["Copy"];
    if (isOwn) options.push("Delete");
    options.push("Cancel");
    const cancelIndex = options.length - 1;
    const destructiveIndex = isOwn ? 1 : undefined;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: destructiveIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            ExpoClipboard.setStringAsync(comment.body);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          } else if (isOwn && buttonIndex === 1) {
            onDelete(comment.id);
          }
        },
      );
    } else {
      // Android fallback: Alert-based menu
      const buttons = [
        {
          text: "Copy",
          onPress: () => {
            ExpoClipboard.setStringAsync(comment.body);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          },
        },
        ...(isOwn
          ? [{ text: "Delete", style: "destructive" as const, onPress: () => onDelete(comment.id) }]
          : []),
        { text: "Cancel", style: "cancel" as const },
      ];
      Alert.alert("Comment", undefined, buttons);
    }
  }, [isTemporary, isOwn, comment, onDelete]);

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        opacity: isTemporary ? 0.7 : 1,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: hasAvatar
            ? t.backgroundSecondary
            : "rgba(147, 51, 234, 0.15)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {hasAvatar ? (
          <Image
            source={{ uri: profile.Media }}
            style={{ width: avatarSize, height: avatarSize }}
            contentFit="cover"
          />
        ) : (
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: isReply ? 14 : 16,
              color: "#9333EA",
            }}
          >
            {initial}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 15,
              color: t.foreground,
              flexShrink: 0,
            }}
          >
            {profile?.MemberFullName ?? "Unknown"}
          </Text>
          {profile?.OfficeName && (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "GeistSans-Light",
                fontSize: 12,
                color: t.foregroundMuted,
                flex: 1,
              }}
            >
              {" \u00B7 "}
              {profile.OfficeName}
            </Text>
          )}
          <View style={{ flexShrink: 0 }}>
            {isTemporary ? (
              <ActivityIndicator size="small" style={{ transform: [{ scale: 0.7 }] }} />
            ) : (
              <Text
                style={{
                  fontFamily: "GeistSans-Light",
                  fontSize: 12,
                  color: t.foregroundMuted,
                }}
              >
                {formatRelativeTime(comment.createdAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Body */}
        {renderBodyWithMentions(comment.body, t.foreground, "#0A84FF")}

        {/* Reply button */}
        {!isTemporary && (
          <Pressable
            onPress={() => onReply(comment)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingTop: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-Light",
                fontSize: 12,
                color: t.foregroundMuted,
              }}
            >
              Reply
            </Text>
          </Pressable>
        )}
      </View>

      {/* Delete action for own comments */}
      {isOwn && !isTemporary && (
        <Pressable
          onPress={() => onDelete(comment.id)}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Trash size={16} color={t.foregroundMuted} />
        </Pressable>
      )}
    </Pressable>
  );
}

// ─── Comment Thread ──────────────────────────────────────────────────

interface CommentThreadProps {
  parent: Comment;
  replies: Comment[];
  profileUid: string;
  t: ReturnType<typeof useThemeColors>;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
}

function CommentThread({
  parent,
  replies,
  profileUid,
  t,
  onReply,
  onDelete,
}: CommentThreadProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visibleReplies = showAll ? replies : replies.slice(0, 2);
  const hasMore = replies.length > 2 && !showAll;

  return (
    <View>
      <CommentRow
        comment={parent}
        isOwn={parent.profileUID === profileUid}
        isTemporary={parent.id < 0}
        t={t}
        onReply={onReply}
        onDelete={onDelete}
      />

      {replies.length > 0 && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingLeft: 60,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 12,
              color: "#0A84FF",
            }}
          >
            {expanded ? "▾" : "▸"} {replies.length}{" "}
            {replies.length === 1 ? "reply" : "replies"}
          </Text>
        </Pressable>
      )}

      {expanded && (
        <View style={{ paddingLeft: 40 }}>
          {visibleReplies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              isReply
              isOwn={reply.profileUID === profileUid}
              isTemporary={reply.id < 0}
              t={t}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
          {hasMore && (
            <Pressable
              onPress={() => setShowAll(true)}
              style={{ paddingLeft: 100, paddingVertical: 8 }}
            >
              <Text
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 12,
                  color: "#0A84FF",
                }}
              >
                Load more replies...
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Mention Suggestion Row ──────────────────────────────────────────

interface MentionSuggestionRowProps {
  tag: CommentTag;
  searchText: string;
  t: ReturnType<typeof useThemeColors>;
  onSelect: (tag: CommentTag) => void;
}

function MentionSuggestionRow({ tag, searchText, t, onSelect }: MentionSuggestionRowProps) {
  const hasAvatar = !!tag.media;

  return (
    <Pressable
      onPress={() => onSelect(tag)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: hasAvatar ? t.backgroundSecondary : "rgba(147, 51, 234, 0.15)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {hasAvatar ? (
          <Image
            source={{ uri: tag.media }}
            style={{ width: 32, height: 32 }}
            contentFit="cover"
          />
        ) : (
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 14, color: "#9333EA" }}>
            {tag.memberFullName?.charAt(0) ?? "?"}
          </Text>
        )}
      </View>

      {/* Name + office */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontFamily: "GeistSans-SemiBold", fontSize: 15, color: t.foreground }}
        >
          {tag.memberFullName}
        </Text>
        {tag.officeName && (
          <Text
            numberOfLines={1}
            style={{ fontFamily: "GeistSans", fontSize: 12, color: t.foregroundMuted }}
          >
            {tag.officeName}
          </Text>
        )}
      </View>

      {/* Priority indicator */}
      {tag.priority <= 2 && (
        <Text style={{ fontSize: 12, color: "#FFA300" }}>★</Text>
      )}
    </Pressable>
  );
}

// ─── Comment Input ───────────────────────────────────────────────────

interface CommentInputProps {
  profileUid: string;
  listingUid: string;
  replyTo: Comment | null;
  onClearReply: () => void;
  onCommentCreated: () => void;
  /** Map of resolved mention name → uid for tagging */
  mentionUidMap: React.MutableRefObject<Map<string, string>>;
  t: ReturnType<typeof useThemeColors>;
}

function CommentInput({
  profileUid,
  listingUid,
  replyTo,
  onClearReply,
  onCommentCreated,
  mentionUidMap,
  t,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const { profile: authProfile } = useAuth();
  const createMutation = useCreateComment(authProfile);
  const inputRef = useRef<TextInput>(null);
  const mentionSearch = useMentionSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Detect @mention typing
  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);

      // Find if cursor is inside an @mention being typed
      const mentionMatch = newText.match(/@(\w*)$/);
      if (mentionMatch) {
        const query = mentionMatch[1];
        if (query.length > 0) {
          mentionSearch.search(profileUid, query);
          setShowSuggestions(true);
        } else {
          // Just typed "@" with no chars yet — show suggestions
          mentionSearch.search(profileUid, "");
          setShowSuggestions(true);
        }
      } else {
        setShowSuggestions(false);
        mentionSearch.clear();
      }
    },
    [profileUid, mentionSearch],
  );

  // Handle mention selection
  const handleSelectMention = useCallback(
    (tag: CommentTag) => {
      const mentionName = `@${tag.memberFullName.replace(/\s+/g, "_")}`;
      // Replace @partial at end of text with full mention
      const newText = text.replace(/@\w*$/, mentionName + " ");
      setText(newText);
      setShowSuggestions(false);
      mentionSearch.clear();
      // Store uid mapping
      mentionUidMap.current.set(mentionName, tag.uid);
      inputRef.current?.focus();
    },
    [text, mentionSearch, mentionUidMap],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Extract @mentions and resolve to UIDs
    const mentions = trimmed.match(/@[\w_]+/g) ?? [];
    const taggedUsers: string[] = mentions
      .map((m) => mentionUidMap.current.get(m))
      .filter((uid): uid is string => !!uid);

    createMutation.mutate(
      {
        profileUID: profileUid,
        listingUID: listingUid,
        comment: trimmed,
        status: "active",
        taggedUsers,
        replyID: replyTo?.id,
      },
      {
        onSuccess: () => {
          setText("");
          onClearReply();
          onCommentCreated();
          Keyboard.dismiss();
          mentionUidMap.current.clear();
        },
      },
    );
  }, [text, profileUid, listingUid, replyTo, createMutation, onClearReply, onCommentCreated, mentionUidMap]);

  const visibleSuggestions = mentionSearch.results.slice(0, 5);
  const extraCount = Math.max(0, mentionSearch.results.length - 5);

  return (
    <View>
      {/* Mention suggestions */}
      {showSuggestions && mentionSearch.results.length > 0 && (
        <View
          style={{
            backgroundColor: t.background,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {visibleSuggestions.map((tag) => (
            <MentionSuggestionRow
              key={tag.uid}
              tag={tag}
              searchText=""
              t={t}
              onSelect={handleSelectMention}
            />
          ))}
          {extraCount > 0 && (
            <Text
              style={{
                fontFamily: "GeistSans-Medium",
                fontSize: 12,
                color: t.foregroundMuted,
                paddingHorizontal: 16,
                paddingBottom: 8,
              }}
            >
              + {extraCount} more
            </Text>
          )}
        </View>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: t.backgroundSecondary,
            gap: 6,
          }}
        >
          <ArrowBendUpRight size={14} color={t.foregroundMuted} />
          <Text
            style={{
              fontFamily: "GeistSans-Light",
              fontSize: 12,
              color: t.foregroundMuted,
            }}
          >
            Replying to
          </Text>
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 12,
              color: t.foreground,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {replyTo.profile?.MemberFullName ?? "Unknown"}
          </Text>
          <Pressable onPress={onClearReply} hitSlop={8}>
            <XCircle size={16} color={t.foregroundMuted} weight="fill" />
          </Pressable>
        </View>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: t.border }} />

      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 10,
        }}
      >
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Add a comment..."
          placeholderTextColor={t.foregroundMuted}
          multiline
          autoCorrect
          autoCapitalize="sentences"
          style={{
            flex: 1,
            fontFamily: "GeistSans",
            fontSize: 15,
            color: t.foreground,
            minHeight: 36,
            maxHeight: 120,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: t.backgroundSecondary,
            borderRadius: 18,
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || createMutation.isPending}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: text.trim() ? "#0A84FF" : t.backgroundSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
              color: text.trim() ? "#FFFFFF" : t.foregroundMuted,
            }}
          >
            ↑
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Sheet ──────────────────────────────────────────────────────

interface CommentsSheetProps {
  listingUid: string;
  profileUid: string;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  onCommentsCountChange?: (count: number) => void;
}

export function CommentsSheet({
  listingUid,
  profileUid,
  bottomSheetRef,
  onCommentsCountChange,
}: CommentsSheetProps) {
  const t = useThemeColors();
  const snapPoints = useMemo(() => ["80%"], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const mentionUidMap = useRef(new Map<string, string>());

  const {
    data: rawComments,
    isLoading,
    refetch,
  } = useComments(listingUid, profileUid, isOpen);

  // Filter and sort comments
  const comments = useMemo(() => {
    if (!rawComments) return [];
    return rawComments
      .filter((c) => !c.isDeleted)
      .sort((a, b) => {
        // Temporary first
        if (a.id < 0 && b.id >= 0) return -1;
        if (a.id >= 0 && b.id < 0) return 1;
        return b.id - a.id;
      });
  }, [rawComments]);

  // Group into threads (replies sorted oldest-first for chronological reading)
  const threads = useMemo(() => {
    const parents = comments.filter((c) => c.replyID == null);
    return parents.map((parent) => ({
      parent,
      replies: comments
        .filter((c) => c.replyID === parent.id)
        .sort((a, b) => a.id - b.id),
    }));
  }, [comments]);

  const deleteMutation = useDeleteComment();

  const handleDelete = useCallback(
    (commentId: number) => {
      Alert.alert("Delete Comment", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(
              { profileUid, commentId, listingUid },
              { onSuccess: () => refetch() },
            );
          },
        },
      ]);
    },
    [profileUid, listingUid, deleteMutation, refetch],
  );

  const handleReply = useCallback((comment: Comment) => {
    setReplyTo(comment);
  }, []);

  const handleCommentCreated = useCallback(() => {
    refetch().then((result) => {
      if (result.data) {
        const activeCount = result.data.filter((c) => !c.isDeleted).length;
        onCommentsCountChange?.(activeCount);
      }
    });
  }, [refetch, onCommentsCountChange]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onChange={(index) => setIsOpen(index >= 0)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: t.background,
        borderRadius: 20,
      }}
      handleIndicatorStyle={{ backgroundColor: t.foregroundMuted }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 17,
              color: t.foreground,
            }}
          >
            Comments
          </Text>
          {comments.length > 0 && (
            <Text
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foregroundMuted,
                marginLeft: 4,
              }}
            >
              ({comments.length})
            </Text>
          )}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => bottomSheetRef.current?.dismiss()}
            hitSlop={8}
          >
            <XCircle size={24} color={t.foregroundMuted} weight="fill" />
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: t.border }} />

        {/* Content — fills all available space between header and input */}
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <ActivityIndicator
              size="large"
              style={{ transform: [{ scale: 1.2 }] }}
            />
            <Text
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foregroundMuted,
              }}
            >
              Loading comments...
            </Text>
          </View>
        ) : comments.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 17,
                color: t.foreground,
              }}
            >
              No comments yet
            </Text>
            <Text
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foregroundMuted,
                marginTop: 4,
              }}
            >
              Be the first to share your thoughts
            </Text>
          </View>
        ) : (
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {threads.map((thread) => (
              <CommentThread
                key={thread.parent.id}
                parent={thread.parent}
                replies={thread.replies}
                profileUid={profileUid}
                t={t}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            ))}
          </BottomSheetScrollView>
        )}

        {/* Input — pinned to bottom */}
        <CommentInput
          profileUid={profileUid}
          listingUid={listingUid}
          replyTo={replyTo}
          onClearReply={() => setReplyTo(null)}
          onCommentCreated={handleCommentCreated}
          mentionUidMap={mentionUidMap}
          t={t}
        />
      </View>
    </BottomSheetModal>
  );
}
