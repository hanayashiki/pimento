"use client";

import React, { useContext } from "react";

import type { User } from "../models";

export type MeContextValue = {
  me: User | null;
};

export const MeContext = React.createContext<MeContextValue>({ me: null });

export const MeProvider = (props: {
  value: MeContextValue;
  children: React.ReactNode;
}) => {
  const { value, children } = props;
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
};

export const useMe = (): { me: User } => {
  const { me } = useContext(MeContext);
  if (!me) {
    throw new Error("Unexpected me to be null");
  }
  return { me };
};
