import type { Job } from "@nomadly/types";
import { formatInr, usdToInr, formatSalaryRange, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  job: Job;
}

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "via RemoteOK",
  weworkremotely: "via We Work Remotely",
  manual: "Direct listing",
};

export function JobCard({ job }: JobCardProps) {
  const salaryInrRange =
    job.salary_min_usd && job.salary_max_usd
      ? `${formatInr(usdToInr(job.salary_min_usd))} – ${formatInr(usdToInr(job.salary_max_usd))}/mo`
      : null;

  return (
    <div className={`card p-5 space-y-3 transition-all hover:border-primary/30 ${job.is_featured ? "border-primary/40 bg-primary/5" : ""}`}>
      {job.is_featured && (
        <div className="flex">
          <Badge variant="primary">⭐ Featured</Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Company logo placeholder */}
        <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-sm font-bold text-text-muted flex-shrink-0">
          {job.company.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary truncate">{job.title}</h3>
          <p className="text-text-muted text-sm">{job.company}</p>
        </div>

        <div className="text-xs text-text-muted flex-shrink-0">
          {timeAgo(job.posted_at)}
        </div>
      </div>

      {/* Tech stack tags */}
      {job.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tech_stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border"
            >
              {tech}
            </span>
          ))}
          {job.tech_stack.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
              +{job.tech_stack.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {formatSalaryRange(job.salary_min_usd, job.salary_max_usd)}
          </p>
          {salaryInrRange && (
            <p className="text-xs text-text-muted">{salaryInrRange}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {job.india_friendly && (
            <Badge variant="success">🇮🇳 India OK</Badge>
          )}
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5 px-3"
          >
            Apply →
          </a>
        </div>
      </div>

      {job.source !== "manual" && (
        <p className="text-xs text-text-muted">
          {SOURCE_LABELS[job.source] || job.source}
        </p>
      )}
    </div>
  );
}
