"use client";

import { HeroSection } from "./HeroSection";
import { QuickStatsGrid } from "./QuickStatsGrid";
import { DashboardPreview } from "./DashboardPreview";
import { ActivityFeed } from "./ActivityFeed";
import Poster from "./Poster";

export const HomeContent = () => {
  return (
    <>
      {/* <HeroSection /> */}
      <Poster />
      <QuickStatsGrid />
      <DashboardPreview />
      <ActivityFeed />
    </>
  );
};
