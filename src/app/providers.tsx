"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="top-right" zIndex={9999} />
      {children}
    </MantineProvider>
  );
}