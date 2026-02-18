import React, { useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { Text, VStack, HStack, Box, Button, Divider } from "@tuesday-ui/ui";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Option = {
  label: string;
  desc: string;
  preview?: string;
};

type Decision = {
  id: number;
  category: string;
  question: string;
  context: string;
  options: Option[];
};

const decisions: Decision[] = [
  /* ── Typography ─────────────────────────────────────────────────── */
  {
    id: 1,
    category: "Typography",
    question: "Primary font — Geist or Inter?",
    context:
      "SwiftUI uses Geist (SF Pro). The current Expo template uses Inter. Both are geometric grotesks but differ in personality — Geist is sharper, Inter is rounder.",
    options: [
      {
        label: "Geist Sans",
        desc: "Matches the SwiftUI app. Sharper, more technical feel.",
        preview: "Aa Bb Cc — The quick brown fox",
      },
      {
        label: "Inter",
        desc: "Already loaded. Excellent screen readability. Widely adopted.",
        preview: "Aa Bb Cc — The quick brown fox",
      },
      {
        label: "SF Pro (system)",
        desc: "Use platform system font. Zero bundle cost. Native feel on iOS.",
        preview: "Aa Bb Cc — The quick brown fox",
      },
    ],
  },
  {
    id: 2,
    category: "Typography",
    question: "How many font weights?",
    context:
      "SwiftUI uses 5 weights (Light→Bold). The Expo template only ships 3 (Regular, Medium, SemiBold). More weights = more font files = larger bundle.",
    options: [
      {
        label: "3 weights",
        desc: "Regular 400 · Medium 500 · SemiBold 600 — lean and sufficient",
      },
      {
        label: "5 weights",
        desc: "Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700 — full range",
      },
    ],
  },
  {
    id: 3,
    category: "Typography",
    question: "Type scale — keep all 10 sizes or trim?",
    context:
      "Current scale: caption (12) → display (48). That's 10 steps. Some like callout (18) and display (48) may never get used in the app.",
    options: [
      {
        label: "Keep 10",
        desc: "Full scale. Future-proof, matches iOS Dynamic Type.",
      },
      {
        label: "Trim to 7",
        desc: "Drop callout, display, largeTitle. Add back only if needed.",
      },
      {
        label: "Trim to 5",
        desc: "caption · body · subheadline · title · headline. Minimal.",
      },
    ],
  },

  /* ── Colors ─────────────────────────────────────────────────────── */
  {
    id: 4,
    category: "Colors",
    question: "Brand accent color?",
    context:
      "Current accent is #0A84FF — literally iOS system blue. This works but isn't distinctive. Tuesday could have its own color.",
    options: [
      {
        label: "iOS Blue #0A84FF",
        desc: "Native feel, familiar, no branding friction.",
        preview: "███████",
      },
      {
        label: "Custom brand color",
        desc: "Define a unique Tuesday accent. Differentiate from stock iOS.",
        preview: "███████  (TBD)",
      },
      {
        label: "Vercel-style #0070F3",
        desc: "Slightly different blue. Matches Geist design language.",
        preview: "███████",
      },
    ],
  },
  {
    id: 5,
    category: "Colors",
    question: "Color naming — semantic or branded?",
    context:
      'SwiftUI uses branded names: GeistGreen, GeistRed, GeistAmber. The Expo template uses semantic: success, error, warning. Semantic is more portable across themes.',
    options: [
      {
        label: "Semantic",
        desc: "success · error · warning · info — meaning-first, theme-agnostic",
      },
      {
        label: "Branded",
        desc: "GeistGreen · GeistRed · GeistAmber — keeps SwiftUI parity",
      },
      {
        label: "Both layers",
        desc: "Branded primitives → semantic aliases. Most flexible, most complex.",
      },
    ],
  },
  {
    id: 6,
    category: "Colors",
    question: "Gray scale — how many steps?",
    context:
      "SwiftUI has 10 grays (50→900). Expo template has 3 (bg, secondary, tertiary). More steps give fine control, fewer steps force consistency.",
    options: [
      {
        label: "3 steps",
        desc: "background · secondary · tertiary — forces constraint",
      },
      {
        label: "5 steps",
        desc: "50 · 100 · 200 · 400 · 800 — enough for hierarchy without noise",
      },
      {
        label: "10 steps",
        desc: "Full 50→900 scale. Maximum flexibility, matches Tailwind.",
      },
    ],
  },
  {
    id: 7,
    category: "Colors",
    question: "Dark mode — default or follow system?",
    context:
      "The Expo template is dark-first (dark is default, light is an override). SwiftUI follows the system setting. This affects both UX and implementation.",
    options: [
      {
        label: "Dark-first",
        desc: "Dark mode is default. Light is opt-in. Matches current template.",
      },
      {
        label: "System-follows",
        desc: "Respect OS light/dark setting. Standard behavior users expect.",
      },
      {
        label: "Dark-only",
        desc: "No light mode. Ship faster. Real estate photos pop on dark.",
      },
    ],
  },

  /* ── Icons ──────────────────────────────────────────────────────── */
  {
    id: 8,
    category: "Icons",
    question: "Icon library?",
    context:
      "SwiftUI uses SF Symbols (500+ native icons). In Expo, SF Symbols only work on iOS. You need a cross-platform strategy.",
    options: [
      {
        label: "expo-symbols",
        desc: "SF Symbols on iOS, Material on Android. Native feel, inconsistent cross-plat.",
      },
      {
        label: "Lucide",
        desc: "Open source, 1400+ icons, consistent everywhere. Popular in web.",
      },
      {
        label: "Phosphor",
        desc: "6 weights per icon, 1200+ icons, flexible, well-designed.",
      },
      {
        label: "Custom SVGs",
        desc: "Full control. Design exactly what you need. More design work.",
      },
    ],
  },

  /* ── Emoji ──────────────────────────────────────────────────────── */
  {
    id: 9,
    category: "Emoji",
    question: "Keep emoji as listing status indicators?",
    context:
      "The SwiftUI app uses emoji for listing status: 🏡 Active, 🚀 New, 💰 Price Change, ☠️ Expired, ⏳ Pending, 🔑 Closed. It's distinctive but informal.",
    options: [
      {
        label: "Keep emoji",
        desc: "Fun, scannable, already works. Users recognize them instantly.",
      },
      {
        label: "Colored dots + labels",
        desc: "More professional. Green dot = Active, Amber = Pending, etc.",
      },
      {
        label: "Icons",
        desc: "Custom or library icons for each status. Polished but more work.",
      },
      {
        label: "Emoji + fallback",
        desc: "Emoji primary, icon fallback for formal contexts (reports, PDFs).",
      },
    ],
  },
  {
    id: 10,
    category: "Emoji",
    question: "Emoji in toasts & notifications?",
    context:
      "Current: ✅ Success, 🛑 Error, ℹ️ Info, 🔄 Progress. Quick to implement but may clash with a polished UI.",
    options: [
      {
        label: "Emoji",
        desc: "Keep it. Fast, fun, recognizable.",
      },
      {
        label: "Icon components",
        desc: "Checkmark, X, info circle. More cohesive with the design system.",
      },
    ],
  },

  /* ── Components ─────────────────────────────────────────────────── */
  {
    id: 11,
    category: "Components",
    question: "Card style — shadows or borders?",
    context:
      "SwiftUI cards use subtle elevation shadows. The Expo template uses flat borders. Shadows feel premium but are harder to get right on Android.",
    options: [
      {
        label: "Shadows",
        desc: "Elevated, premium. Matches iOS native feel. Harder on Android.",
      },
      {
        label: "Borders",
        desc: "Flat, clean, consistent cross-platform. Modern trend.",
      },
      {
        label: "Hybrid",
        desc: "Subtle border + very light shadow. Best of both but more tokens.",
      },
    ],
  },
  {
    id: 12,
    category: "Components",
    question: "Loading state pattern?",
    context:
      "SwiftUI uses Lottie animations. In Expo you could use Reanimated-based shimmer, skeleton screens, or simple spinners. Each has different complexity.",
    options: [
      {
        label: "Shimmer / Skeleton",
        desc: "Content-shaped placeholders that pulse. Premium feel, moderate effort.",
      },
      {
        label: "Spinner",
        desc: "Simple activity indicator. Fast to implement, universal.",
      },
      {
        label: "Lottie",
        desc: "Custom animations like SwiftUI. Beautiful but adds dependency.",
      },
    ],
  },
  {
    id: 13,
    category: "Components",
    question: "Border radius philosophy?",
    context:
      'Default is md (8px). 2025–26 trend is sharper corners (4px or less). SwiftUI app uses 8px. Rounder feels friendlier, sharper feels more modern.',
    options: [
      {
        label: "Rounded (8px default)",
        desc: "Current setting. Friendly, familiar, safe.",
      },
      {
        label: "Sharp (4px default)",
        desc: "Modern, minimal, editorial. Trending in 2025–26.",
      },
      {
        label: "Mixed",
        desc: "Sharp for cards/containers, rounded for buttons/inputs.",
      },
    ],
  },

  /* ── Architecture ───────────────────────────────────────────────── */
  {
    id: 14,
    category: "Architecture",
    question: "Navigation — native tabs or custom tab bar?",
    context:
      "SwiftUI uses native TabView. Expo Router supports native tabs (fast, system-standard) or fully custom tab bars (design freedom, more effort).",
    options: [
      {
        label: "Native tabs",
        desc: "expo-router Tabs. Fast, accessible, platform-standard behavior.",
      },
      {
        label: "Custom tab bar",
        desc: "Full design control. Animations, custom icons, unique layout.",
      },
      {
        label: "Native + custom styling",
        desc: "Native tabs with custom appearance (icons, colors, badges).",
      },
    ],
  },
  {
    id: 15,
    category: "Architecture",
    question: "Animation approach?",
    context:
      "Reanimated is already a dependency. Moti adds a declarative API on top (closer to SwiftUI's animation model). Question is whether the convenience is worth the extra dependency.",
    options: [
      {
        label: "Reanimated only",
        desc: "Already installed. Powerful, lower-level. More boilerplate.",
      },
      {
        label: "Reanimated + Moti",
        desc: "Declarative animations. Feels like SwiftUI. Tiny extra dependency.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

const categoryColors: Record<string, string> = {
  Typography: "#A78BFA",
  Colors: "#F472B6",
  Icons: "#FBBF24",
  Emoji: "#34D399",
  Components: "#60A5FA",
  Architecture: "#F97316",
};

const categoryEmoji: Record<string, string> = {
  Typography: "Aa",
  Colors: "◆",
  Icons: "⬡",
  Emoji: "☻",
  Components: "□",
  Architecture: "⌂",
};

function CategoryPill({ category }: { category: string }) {
  const color = categoryColors[category] ?? "#888";
  return (
    <Box
      className="rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: color + "20" }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>
        {category.toUpperCase()}
      </Text>
    </Box>
  );
}

function OptionCard({
  option,
  selected,
  onSelect,
  index,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <Pressable onPress={onSelect}>
      <Box
        className="rounded-xl px-4 py-3"
        style={{
          backgroundColor: selected ? "#FFFFFF10" : "#FFFFFF05",
          borderWidth: 1.5,
          borderColor: selected ? "#FFFFFF30" : "#FFFFFF08",
        }}
      >
        <HStack className="gap-3 items-start">
          {/* Selection indicator */}
          <Box
            className="mt-0.5 w-5 h-5 rounded-full items-center justify-center"
            style={{
              borderWidth: 2,
              borderColor: selected ? "#0A84FF" : "#FFFFFF25",
              backgroundColor: selected ? "#0A84FF" : "transparent",
            }}
          >
            {selected && (
              <Text
                style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }}
              >
                ✓
              </Text>
            )}
          </Box>

          <VStack className="flex-1 gap-1">
            <Text
              className="font-semibold"
              style={{
                color: selected ? "#FFFFFF" : "#FFFFFFCC",
                fontSize: 15,
              }}
            >
              {option.label}
            </Text>
            <Text style={{ color: "#FFFFFF80", fontSize: 13, lineHeight: 18 }}>
              {option.desc}
            </Text>
            {option.preview && (
              <Box
                className="mt-1.5 rounded-lg px-3 py-2"
                style={{ backgroundColor: "#FFFFFF08" }}
              >
                <Text
                  style={{
                    color: "#FFFFFF60",
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                >
                  {option.preview}
                </Text>
              </Box>
            )}
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

function DecisionCard({
  decision,
  number,
  selection,
  onSelect,
}: {
  decision: Decision;
  number: number;
  selection: number | null;
  onSelect: (optionIndex: number) => void;
}) {
  const catColor = categoryColors[decision.category] ?? "#888";

  return (
    <VStack className="gap-4">
      {/* Header */}
      <VStack className="gap-2">
        <HStack className="gap-2 items-center">
          <Box
            className="w-7 h-7 rounded-lg items-center justify-center"
            style={{ backgroundColor: catColor + "18" }}
          >
            <Text
              style={{
                color: catColor,
                fontSize: 12,
                fontWeight: "700",
                fontFamily: "monospace",
              }}
            >
              {number}
            </Text>
          </Box>
          <CategoryPill category={decision.category} />
        </HStack>
        <Text
          className="font-bold"
          style={{ color: "#FFFFFF", fontSize: 19, lineHeight: 26 }}
        >
          {decision.question}
        </Text>
        <Text style={{ color: "#FFFFFF70", fontSize: 14, lineHeight: 21 }}>
          {decision.context}
        </Text>
      </VStack>

      {/* Options */}
      <VStack className="gap-2">
        {decision.options.map((opt, i) => (
          <OptionCard
            key={opt.label}
            option={opt}
            selected={selection === i}
            onSelect={() => onSelect(i)}
            index={i}
          />
        ))}
      </VStack>
    </VStack>
  );
}

function ProgressBar({
  answered,
  total,
}: {
  answered: number;
  total: number;
}) {
  const pct = total > 0 ? (answered / total) * 100 : 0;
  return (
    <VStack className="gap-2">
      <HStack className="justify-between items-center">
        <Text style={{ color: "#FFFFFF60", fontSize: 13 }}>
          {answered} of {total} decided
        </Text>
        <Text
          style={{
            color: answered === total ? "#34D399" : "#FFFFFF40",
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          {Math.round(pct)}%
        </Text>
      </HStack>
      <Box
        className="w-full rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: "#FFFFFF10" }}
      >
        <Box
          className="rounded-full"
          style={{
            height: 4,
            width: `${pct}%`,
            backgroundColor: answered === total ? "#34D399" : "#0A84FF",
          }}
        />
      </Box>
    </VStack>
  );
}

function SummarySection({
  selections,
}: {
  selections: Record<number, number>;
}) {
  const answered = decisions.filter((d) => selections[d.id] !== undefined);
  if (answered.length === 0) return null;

  return (
    <VStack className="gap-3">
      <Divider />
      <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 17 }}>
        Summary
      </Text>
      <VStack className="gap-2">
        {answered.map((d) => {
          const picked = d.options[selections[d.id]];
          const catColor = categoryColors[d.category] ?? "#888";
          return (
            <HStack key={d.id} className="gap-2 items-start">
              <Text style={{ color: catColor, fontSize: 13, fontWeight: "600", width: 18 }}>
                {d.id}.
              </Text>
              <VStack className="flex-1 gap-0">
                <Text style={{ color: "#FFFFFFCC", fontSize: 13 }}>
                  {d.question}
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>
                  → {picked.label}
                </Text>
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

const categories = ["Typography", "Colors", "Icons", "Emoji", "Components", "Architecture"];

export default function DesignDecisions() {
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSelect = (decisionId: number, optionIndex: number) => {
    setSelections((prev) => {
      if (prev[decisionId] === optionIndex) {
        const next = { ...prev };
        delete next[decisionId];
        return next;
      }
      return { ...prev, [decisionId]: optionIndex };
    });
  };

  const answeredCount = Object.keys(selections).length;

  const filteredDecisions = activeCategory
    ? decisions.filter((d) => d.category === activeCategory)
    : decisions;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: "#050505" }}
      showsVerticalScrollIndicator={false}
    >
      <VStack className="p-5 max-w-xl mx-auto gap-8 pb-20">
        {/* ── Header ──────────────────────────────────────────────── */}
        <VStack className="gap-3 pt-8">
          <Link href="/showcase" asChild>
            <Button variant="ghost" size="sm">
              ← Back to Showcase
            </Button>
          </Link>

          <VStack className="gap-1">
            <Text style={{ color: "#FFFFFF15", fontSize: 72, fontWeight: "900", lineHeight: 72 }}>
              DS
            </Text>
            <Text
              className="font-bold"
              style={{ color: "#FFFFFF", fontSize: 30, lineHeight: 36, marginTop: -20 }}
            >
              Design Decisions
            </Text>
          </VStack>

          <Text style={{ color: "#FFFFFF70", fontSize: 15, lineHeight: 22 }}>
            15 open questions for the Tuesday design system. Tap to choose.
            Bring answers to the call.
          </Text>

          <ProgressBar answered={answeredCount} total={decisions.length} />
        </VStack>

        {/* ── Category filters ────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <Pressable onPress={() => setActiveCategory(null)}>
            <Box
              className="rounded-full px-3.5 py-1.5"
              style={{
                backgroundColor: !activeCategory ? "#FFFFFF15" : "#FFFFFF05",
                borderWidth: 1,
                borderColor: !activeCategory ? "#FFFFFF20" : "#FFFFFF08",
              }}
            >
              <Text
                style={{
                  color: !activeCategory ? "#FFFFFF" : "#FFFFFF50",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                All ({decisions.length})
              </Text>
            </Box>
          </Pressable>

          {categories.map((cat) => {
            const count = decisions.filter((d) => d.category === cat).length;
            const isActive = activeCategory === cat;
            const color = categoryColors[cat];
            return (
              <Pressable key={cat} onPress={() => setActiveCategory(isActive ? null : cat)}>
                <Box
                  className="rounded-full px-3.5 py-1.5"
                  style={{
                    backgroundColor: isActive ? color + "20" : "#FFFFFF05",
                    borderWidth: 1,
                    borderColor: isActive ? color + "40" : "#FFFFFF08",
                  }}
                >
                  <HStack className="gap-1.5 items-center">
                    <Text style={{ fontSize: 12 }}>
                      {categoryEmoji[cat]}
                    </Text>
                    <Text
                      style={{
                        color: isActive ? color : "#FFFFFF50",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {cat} ({count})
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Decision cards ──────────────────────────────────────── */}
        <VStack className="gap-10">
          {filteredDecisions.map((decision, idx) => (
            <React.Fragment key={decision.id}>
              {idx > 0 && (
                <Box
                  className="w-full"
                  style={{ height: 1, backgroundColor: "#FFFFFF08" }}
                />
              )}
              <DecisionCard
                decision={decision}
                number={decision.id}
                selection={
                  selections[decision.id] !== undefined
                    ? selections[decision.id]
                    : null
                }
                onSelect={(optionIndex) =>
                  handleSelect(decision.id, optionIndex)
                }
              />
            </React.Fragment>
          ))}
        </VStack>

        {/* ── Summary ─────────────────────────────────────────────── */}
        <SummarySection selections={selections} />

        {/* ── Footer ──────────────────────────────────────────────── */}
        <VStack className="gap-3 pt-4">
          <Divider />
          <Text style={{ color: "#FFFFFF30", fontSize: 12, textAlign: "center" }}>
            tuesday-ui design system · collab call prep
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
