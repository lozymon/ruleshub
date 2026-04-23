import type { PackageDto, UserDto } from "@ruleshub/types";
import { apiClient } from "./client";

export interface LeaderboardData {
  topPublishers: (UserDto & { _count: { packages: number } })[];
  trendingPackages: PackageDto[];
  mostStarred: PackageDto[];
}

export function getLeaderboard(): Promise<LeaderboardData> {
  return apiClient.get<LeaderboardData>("/leaderboard");
}
