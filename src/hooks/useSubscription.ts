import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetUserProfileQuery } from "@/redux/queries/userApi";

export const SUBSCRIPTION_MONTHS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type Subscription = {
  isActive: boolean;
  plan: string | null;
  startedAt: string | null;
  expiresAt: string | null;
};

/**
 * Single source of truth for "can this user open paid courses?".
 * The expiry is re-checked on every render so a subscription that lapses
 * while the tab is open locks the content without needing a re-login.
 */
export const useSubscription = () => {
  const { userInfo } = useSelector((state: any) => state.auth);

  // Cached login data can be stale, so the profile response wins when available
  const { data: profile, isLoading } = useGetUserProfileQuery(undefined, {
    skip: !userInfo,
  });

  const subscription: Subscription | null = profile?.subscription || userInfo?.subscription || null;

  return useMemo(() => {
    const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
    const isActive = Boolean(subscription?.isActive && expiresAt && expiresAt.getTime() > Date.now());

    const daysLeft =
      isActive && expiresAt
        ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / MS_PER_DAY))
        : 0;

    return {
      isSubscribed: isActive,
      // true only for someone who subscribed before and let it lapse
      isExpired: Boolean(expiresAt) && !isActive,
      expiresAt,
      startedAt: subscription?.startedAt ? new Date(subscription.startedAt) : null,
      daysLeft,
      isLoading: Boolean(userInfo) && isLoading,
    };
  }, [subscription, userInfo, isLoading]);
};

export const formatSubscriptionDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";
