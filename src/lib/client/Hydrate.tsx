"use client";

import { HydrationBoundary as OldHydrate } from "@tanstack/react-query";

const Hydrate: typeof OldHydrate = (props) => <OldHydrate {...props} />;

export default Hydrate;
