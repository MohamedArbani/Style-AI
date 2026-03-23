import * as Haptics from "expo-haptics";
import { requireNativeModule } from "expo";

import type { NativeCoreHapticsModule } from "./NativeCoreHaptics.types";

// Fallback using expo-haptics — used in Expo Go where the native module is unavailable.
const fallback: NativeCoreHapticsModule = {
  impact: async (_sharpness: number, intensity: number) => {
    if (intensity > 0.5) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (intensity > 0.2) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  playPattern: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
};

let nativeModule: NativeCoreHapticsModule;
try {
  nativeModule =
    requireNativeModule<NativeCoreHapticsModule>("NativeCoreHaptics");
} catch {
  nativeModule = fallback;
}

export default nativeModule;
