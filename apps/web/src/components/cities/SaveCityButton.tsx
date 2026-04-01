"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  cityId: string;
}

export function SaveCityButton({ cityId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_cities")
      .select("city_id")
      .eq("user_id", user.id)
      .eq("city_id", cityId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, cityId]);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    if (saved) {
      await supabase
        .from("saved_cities")
        .delete()
        .eq("user_id", user.id)
        .eq("city_id", cityId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_cities")
        .insert({ user_id: user.id, city_id: cityId });
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
        saved
          ? "bg-primary/10 border-primary/40 text-primary"
          : "border-border text-text-muted hover:border-primary/40 hover:text-primary"
      }`}
    >
      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {saved ? "Saved" : "Save city"}
    </button>
  );
}
