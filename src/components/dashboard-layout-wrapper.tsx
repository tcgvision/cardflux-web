import { SkeletonWrapper } from "./skeleton-wrapper";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return <SkeletonWrapper>{children}</SkeletonWrapper>;
} 