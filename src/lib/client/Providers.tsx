"use client";
import React from "react";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 0,
          staleTime: 1000,
        },
        mutations: {
          retry: 0,
        },
      },
    }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default Providers;
