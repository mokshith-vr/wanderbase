import Link from "next/link";
import Image from "next/image";
import type { City } from "@nomadly/types";
import { formatInr, usdToInr } from "@/lib/utils";
import { VisaBadge } from "@/components/ui/badge";

interface CityCardProps {
  city: City;
  visaType?: import("@nomadly/types").VisaType;
}

export function CityCard({ city, visaType }: CityCardProps) {
  const monthlyInr = formatInr(usdToInr(city.monthly_total_budget_usd));

  return (
    <Link href={`/cities/${city.slug}`} className="block group">
      <div className="card-hover overflow-hidden h-full flex flex-col">
        {/* Photo */}
        <div className="relative h-44 w-full overflow-hidden bg-surface-2">
          {city.image_url ? (
            <Image
              src={city.image_url}
              alt={city.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary-light to-accent-light">
              {city.flag_emoji}
            </div>
          )}
          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Visa badge on image */}
          {visaType && (
            <div className="absolute top-3 right-3">
              <VisaBadge type={visaType} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Name + flag */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{city.flag_emoji}</span>
            <div>
              <h3 className="font-bold text-text-primary text-sm leading-tight">{city.name}</h3>
              <p className="text-text-muted text-xs">{city.country}</p>
            </div>
          </div>

          {/* Cost */}
          <div>
            <p className="text-lg font-bold text-text-primary">{monthlyInr}</p>
            <p className="text-text-muted text-xs">per month</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            <div className="bg-surface-2 rounded-lg p-2 text-center">
              <p className="text-[10px] text-text-muted leading-tight">Internet</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">{city.internet_speed_mbps}M</p>
            </div>
            <div className="bg-surface-2 rounded-lg p-2 text-center">
              <p className="text-[10px] text-text-muted leading-tight">Safety</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">{city.safety_score}</p>
            </div>
            <div className="bg-surface-2 rounded-lg p-2 text-center">
              <p className="text-[10px] text-text-muted leading-tight">English</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5 capitalize">{city.english_proficiency}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
