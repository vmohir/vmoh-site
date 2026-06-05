import { useEffect, useState } from "preact/hooks";

// Reactive CSS media-query match. Starts false on the server / first paint and
// resolves on mount, so guard layout that must not flash if needed.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
