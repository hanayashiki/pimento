import React, { startTransition } from "react";

export const ClientOnly: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};
