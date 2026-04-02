"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatInr, usdToInr } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface SavedCity {
  id: string;
  slug: string;
  name: string;
  country: string;
  country_code: string;
  flag_emoji: string;
  image_url?: string | null;
  monthly_total_budget_usd: number;
  internet_speed_mbps: number;
  safety_score: number;
  english_proficiency: string;
}

interface Props {
  user: User;
  savedCities: SavedCity[];
}

export function DashboardClient({ user, savedCities }: Props) {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Nomad";
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-text-primary">{name}</h1>
            <p className="text-text-muted text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn-secondary text-sm py-2 px-4"
        >
          Sign out
        </button>
      </div>

      {/* Saved Cities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Saved Cities</h2>
          <Link href="/cities" className="text-primary text-sm hover:underline">
            Explore more →
          </Link>
        </div>

        {savedCities.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-3">🌍</p>
            <p className="text-text-muted mb-4">No saved cities yet. Start exploring!</p>
            <Link href="/cities" className="btn-primary text-sm py-2 px-4">
              Browse cities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedCities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="card-hover overflow-hidden flex items-center gap-0 group"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-16 flex-shrink-0 bg-surface-2">
                  {city.image_url ? (
                    <Image src={city.image_url} alt={city.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{city.flag_emoji}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{city.name}</p>
                    <p className="text-text-muted text-sm">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-medium text-sm">
                      {formatInr(usdToInr(city.monthly_total_budget_usd))}/mo
                    </p>
                    <p className="text-text-muted text-xs">{city.internet_speed_mbps} Mbps</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-text-primary mb-4">Quick Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Visa Checker", href: "/visa-checker", icon: "🛂" },
            { label: "Cost Calculator", href: "/cost-calculator", icon: "₹" },
            { label: "Explore Cities", href: "/cities", icon: "🌍" },
            { label: "Blog", href: "/blog", icon: "📖" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover p-4 text-center"
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <span className="text-text-muted text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
