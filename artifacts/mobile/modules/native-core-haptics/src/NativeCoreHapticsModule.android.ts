import type { NativeCoreHapticsModule } from "./NativeCoreHaptics.types";

// No-op stub for Android — Core Haptics is iOS-only.
const stub: NativeCoreHapticsModule = {
  impact: () => Promise.resolve(),
  playPattern: () => Promise.resolve(),
};

export default stub;
