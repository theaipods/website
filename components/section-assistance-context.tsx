"use client";
import { createContext, type ReactNode } from 'react';
export const SectionAssistanceContext = createContext<((title: ReactNode) => ReactNode) | null>(null);
