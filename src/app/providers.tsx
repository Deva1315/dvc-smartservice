"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider defaultColorScheme="light" forceColorScheme="light">
      <ModalsProvider>
        <Notifications position="top-right" zIndex={9999} />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}