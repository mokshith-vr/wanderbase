"use client";

import { useState, useEffect } from "react";
import { getJobs } from "@/lib/api";
import { getAffiliateLink, trackAffiliateClick } from "@/lib/affiliate";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/skeleton";
import type { Job } from "@nomadly/types";
import { cn } from "@/lib/utils";

const TECH_STACKS = [
  "React", "Python", "Go", "TypeScript", "Node.js",
  "Rust", "Data Engineering", "ML/AI", "Design", "DevOps",
];

const SALARY_FILTERS = [
  { label: "Any salary", value: 0 },
  { label: "$3,000+/mo", value: 3000 },
  { label: "$5,000+/mo", value: 5000 },
  { label: "$7,000+/mo", value: 7000 },
];

type LoadState = "loading" | "loaded" | "error";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(0);

  async function loadJobs() {
    setState("loading");
    const res = await getJobs({
      stack: selectedStack.length > 0 ? selectedStack.join(",") : undefined,
      min_salary: minSalary > 0 ? minSalary : undefined,
      india_friendly: true,
      limit: 25,
    });

    if (res.success && res.data) {
      setJobs(res.data);
      setTotal(res.meta?.total || res.data.length);
      setState("loaded");
    } else {
      setState("error");
    }
  }

  useEffect(() => {
    loadJobs();
  }, [selectedStack, minSalary]);

  function toggleStack(stack: string) {
    setSelectedStack((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Remote Jobs</h1>
              <p className="text-text-muted text-sm mt-1">
                India-friendly only · Salaries in USD and ₹
              </p>
            </div>

            {/* Filters */}
            <div className="card p-4 space-y-4">
              <h2 className="font-semibold text-text-secondary text-sm uppercase tracking-wide">
                Filters
              </h2>

              {/* Tech stack */}
              <div>
                <p className="text-xs text-text-muted mb-2">Tech stack</p>
                <div className="flex flex-wrap gap-2">
                  {TECH_STACKS.map((stack) => (
                    <button
                      key={stack}
                      onClick={() => toggleStack(stack)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border transition-colors",
                        selectedStack.includes(stack)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-surface-2 text-text-secondary border-border hover:border-primary/40"
                      )}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min salary */}
              <div>
                <p className="text-xs text-text-muted mb-2">Minimum salary</p>
                <div className="space-y-1">
                  {SALARY_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setMinSalary(f.value)}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                        minSalary === f.value
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-surface-2"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(selectedStack.length > 0 || minSalary > 0) && (
                <button
                  onClick={() => {
                    setSelectedStack([]);
                    setMinSalary(0);
                  }}
                  className="text-xs text-danger hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* NordVPN affiliate */}
            <a
              href={getAffiliateLink("nordvpn")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("nordvpn", "job_board")}
              className="block p-4 rounded-xl border border-border hover:border-primary/30 bg-surface transition-all group"
            >
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                NordVPN
              </p>
              <p className="text-xs text-text-muted mt-1">
                Access Indian streaming & UPI from abroad. 68% off.
              </p>
              <p className="text-xs text-primary mt-2">Get offer ↗</p>
            </a>
            <p className="text-xs text-text-muted text-center -mt-3">
              We may earn a commission
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-text-muted text-sm">
              {state === "loaded" && (
                <>
                  <span className="font-semibold text-text-primary">{total}</span>{" "}
                  India-friendly remote jobs
                </>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Updated today
            </div>
          </div>

          {/* Loading state */}
          {state === "loading" && (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="card p-10 text-center">
              <p className="text-danger font-medium mb-2">Failed to load jobs</p>
              <button onClick={loadJobs} className="btn-secondary text-sm">
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {state === "loaded" && jobs.length === 0 && (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-bold text-text-primary mb-2">
                No jobs match your filters
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Try removing some filters to see more results.
              </p>
              <button
                onClick={() => {
                  setSelectedStack([]);
                  setMinSalary(0);
                }}
                className="btn-secondary text-sm"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Job list */}
          {state === "loaded" && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              <div className="card p-6 text-center">
                <p className="text-text-muted text-sm mb-2">
                  Want to post a job? Reach 5,000+ Indian remote workers.
                </p>
                <a
                  href="mailto:jobs@wanderbase.in"
                  className="btn-secondary text-sm inline-block"
                >
                  Post a job — $49 →
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
