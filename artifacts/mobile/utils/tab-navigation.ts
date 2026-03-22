type TabRouteName = "index" | "ai-style" | "try-on" | "profile";

let lastTabRouteName: TabRouteName = "index";

export function setLastTabRouteName(routeName: string) {
  if (
    routeName === "index" ||
    routeName === "ai-style" ||
    routeName === "try-on" ||
    routeName === "profile"
  ) {
    lastTabRouteName = routeName;
  }
}

export function getLastTabRouteName(): TabRouteName {
  return lastTabRouteName;
}

export function getTabHref(routeName: TabRouteName = lastTabRouteName) {
  if (routeName === "index") {
    return "/(tabs)" as const;
  }

  return `/(tabs)/${routeName}` as const;
}
