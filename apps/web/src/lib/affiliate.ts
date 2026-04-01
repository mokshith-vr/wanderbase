// Affiliate link generators + PostHog tracking stub
// Real PostHog integration: replace trackEvent with posthog.capture(...)

function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).posthog) {
    (window as unknown as Record<string, {capture: (e: string, p?: unknown) => void}>).posthog.capture(event, props);
  }
}

export type AffiliatePartner = "safetywing" | "airalo" | "wise" | "nordvpn";

const AFFILIATE_LINKS: Record<AffiliatePartner, string> = {
  safetywing: "https://safetywing.com/?referenceID=wanderbase",
  airalo: "https://ref.airalo.com/wanderbase",
  wise: "https://wise.com/invite/wanderbase",
  nordvpn: "https://go.nordvpn.net/wanderbase",
};

export function getAffiliateLink(partner: AffiliatePartner): string {
  return AFFILIATE_LINKS[partner];
}

export function trackAffiliateClick(
  partner: AffiliatePartner,
  context?: string
) {
  trackEvent("affiliate_click", { partner, context });
}

export const AFFILIATE_DATA = {
  safetywing: {
    name: "SafetyWing",
    tagline: "Travel insurance built for nomads",
    cta: "Get covered from $45/month",
    description: "Remote Health & Nomad Insurance — trusted by 100,000+ nomads",
    partner: "safetywing" as AffiliatePartner,
    badge: "10% commission",
  },
  airalo: {
    name: "Airalo",
    tagline: "Local eSIM for 200+ countries",
    cta: "Get your eSIM",
    description: "No roaming charges. Buy a local data plan before you land.",
    partner: "airalo" as AffiliatePartner,
    badge: "10–15% commission",
  },
  wise: {
    name: "Wise",
    tagline: "Send money without hidden fees",
    cta: "Transfer money for free",
    description: "Real exchange rates, 8x cheaper than banks. Get first transfer free.",
    partner: "wise" as AffiliatePartner,
    badge: "$15–30/signup",
  },
  nordvpn: {
    name: "NordVPN",
    tagline: "Access Indian streaming from abroad",
    cta: "Get 68% off NordVPN",
    description: "Access Hotstar, Netflix India, and UPI from anywhere.",
    partner: "nordvpn" as AffiliatePartner,
    badge: "$40–100/signup",
  },
};
