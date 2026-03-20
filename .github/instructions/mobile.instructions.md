---
applyTo: "artifacts/mobile/**"
---

# Mobile App — Expo / React Native Instructions

## Stack

- Expo SDK ~54, React Native 0.81.5, Expo Router ~6
- New Architecture enabled (`newArchEnabled: true`)
- React Compiler enabled (`experiments.reactCompiler: true`)
- TypeScript strict mode

## Project Layout

```
artifacts/mobile/
  app/
    _layout.tsx              Root layout (fonts, providers, auth redirect)
    (tabs)/
      _layout.tsx            Tab bar (NativeTabLayout or ClassicTabLayout)
      index.tsx              Wardrobe screen
      ai-style.tsx           AI outfit recommendations
      try-on.tsx             AI virtual try-on
      profile.tsx            User profile
    auth/
      login.tsx
      register.tsx
    setup/                   Onboarding flow (language → gender → age → height → style)
    wardrobe/
      add.tsx                Add wardrobe item (photo scan + form)
    onboarding.tsx
    premium.tsx
  components/               Reusable components
  context/
    AuthContext.tsx          Auth state (AsyncStorage session)
    WardrobeContext.tsx      Wardrobe items + AI operations
  constants/colors.ts       Brand colours (#1B2CC1)
```

## Routing & Navigation

- File-based routing via Expo Router. Tab routes live in `app/(tabs)/`.
- Auth guard in `app/_layout.tsx`: no user → `/onboarding`, not onboarded → `/setup/language`, else → `/(tabs)`
- Tab layout chooses between `NativeTabLayout` (when `isLiquidGlassAvailable()`) and `ClassicTabLayout`
- New screens: add a `.tsx` file in the correct directory. Expo Router automatically registers it.

## State & Data Fetching

- `AuthContext` provides: `user`, `isLoading`, `isOnboarded`, `login`, `register`, `logout`, `updateProfile`, `completeOnboarding`
- `WardrobeContext` provides: `items`, `isLoading`, `fetchItems`, `addItem`, `removeItem`, `scanItem`, `recommendOutfits`, `generateTryOn`
- Session stored in AsyncStorage under key `smart_wardrobe_session_v2`
- API base URL: `process.env.EXPO_PUBLIC_API_URL` (required in `.env`)
- Use `useFocusEffect` to refresh data when a tab gains focus

## Styling Rules

- **No Tailwind** — use `StyleSheet.create(...)` at bottom of each file
- Brand colour: `#1B2CC1` (royal blue/indigo)
- Font family: Inter — weights 400/500/600/700 loaded at root layout
- Support light/dark mode via `useColorScheme()`
- `SafeAreaProvider` wraps the entire app

## Component Rules

- Use `Pressable` (not `TouchableOpacity`)
- Use `expo-image` (not `<Image>` from react-native) for wardrobe photos
- Wrap all text in `<Text>` — never render bare strings
- Use ternary conditionals for conditional rendering, **never** `{count && <Component />}` (falsy 0 renders "0")
- `KeyboardAwareScrollViewCompat` for scrollable forms
- Toast notifications via `useToast()` from `components/Toast.tsx`

## Performance

- In `FlatList`, never create objects/arrays inline in `renderItem` — hoist outside the component or use `useCallback`
- For item grid (2-column), pass `numColumns={2}` and use `keyExtractor` with stable IDs
- Animations: use `react-native-reanimated` `useSharedValue`/`useAnimatedStyle`; animate only `transform`/`opacity`
- `GestureDetector` from `react-native-gesture-handler` for gestures

## Image Handling

- Camera/gallery: `expo-image-picker` (`launchImageLibraryAsync` / `launchCameraAsync`)
- Convert to base64 before sending to AI: `base64: true` in picker options
- Always validate image size before sending (API limit: 20mb base64)

## Adding a New AI Feature

1. Update `lib/api-spec/openapi.yaml` with the new endpoint
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Implement the route in `artifacts/api-server/src/routes/`
4. Add the call in `context/WardrobeContext.tsx`
5. Use the new method in the screen component

## Environment Variables (mobile)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For physical devices on the same Wi-Fi, use your machine's LAN IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```
