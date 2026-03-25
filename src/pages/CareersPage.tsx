import React, { useState, useMemo } from "react";
import {
  Search, MapPin, Briefcase, Clock, DollarSign, ChevronDown, ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useJobOpenings, type JobOpening } from "@/hooks/useJobOpenings";

/* ─── Expandable Job Card ─── */
const JobCard: React.FC<{ job: JobOpening; onApply: () => void }> = ({ job, onApply }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-background rounded-2xl border transition-shadow hover:shadow-card-hover ${
      job.featured ? "border-l-4 border-l-cta border-t border-r border-b border-border shadow-card" : "border-border shadow-card"
    }`}>
      <div className="p-5 md:p-6">
        {job.featured && (
          <Badge className="mb-2.5 rounded-full bg-[hsl(var(--cta)/0.1)] text-cta border-[hsl(var(--cta)/0.25)] text-[10px] uppercase tracking-wider font-semibold">
            Featured Role
          </Badge>
        )}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <Briefcase className="w-3 h-3" /> {job.department}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <Clock className="w-3 h-3" /> {job.type}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <DollarSign className="w-3 h-3" /> {job.salary}
              </span>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-cta text-sm font-medium inline-flex items-center gap-1 hover:underline"
            >
              {expanded ? "Hide Details" : "View Full Details"} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
          <Button onClick={onApply} className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-full px-6 h-10 font-semibold text-sm shrink-0 self-start">
            Apply Now →
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border px-5 md:px-6 py-5 bg-[hsl(var(--muted)/0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {job.responsibilities?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2 text-cta">
                  <Briefcase className="w-4 h-4" /> Key Responsibilities
                </h4>
                <ul className="space-y-1.5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.requirements?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2 text-cta">
                  <ChevronRight className="w-4 h-4" /> Requirements
                </h4>
                <ul className="space-y-1.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Loading Skeleton ─── */
const JobCardSkeleton = () => (
  <div className="bg-background rounded-2xl border border-border shadow-card p-5 md:p-6">
    <Skeleton className="h-5 w-40 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-3/4 mb-3" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

/* ─── Page ─── */
const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  const { openings, loading, departments, locations } = useJobOpenings();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [location, setLocation] = useState("All Locations");

  const filtered = useMemo(() => {
    return openings.filter((j) => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
      const matchDept = department === "All Departments" || j.department === department;
      const matchLoc = location === "All Locations" || j.location === location;
      return matchSearch && matchDept && matchLoc;
    });
  }, [search, department, location, openings]);

  const applyUrl = (job: JobOpening) =>
    `/careers/apply?title=${encodeURIComponent(job.title)}&dept=${encodeURIComponent(job.department)}&loc=${encodeURIComponent(job.location)}&jobId=${encodeURIComponent(job._id)}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--muted)/0.3)]">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-3 rounded-full bg-[hsl(var(--success)/0.12)] text-success border-[hsl(var(--success)/0.25)]">
              <Briefcase className="w-3.5 h-3.5 mr-1" /> Now Hiring
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Open Positions</h1>
            <p className="text-muted-foreground mt-2">
              {openings.length} opportunities across Australia · Explore roles that match your skills
            </p>
          </div>

          {/* Filters */}
          <div className="bg-background rounded-2xl shadow-card border border-border p-4 mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search positions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-border" />
            </div>
            <div className="relative flex-1">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full h-10 pl-9 pr-8 rounded-md border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-10 pl-9 pr-8 rounded-md border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                {locations.map((l) => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-medium mb-4">
            Showing <span className="text-success font-semibold">{filtered.length}</span> of {openings.length} positions
          </p>

          {/* Job Cards */}
          <div className="space-y-4">
            {loading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : (
              <>
                {filtered.map((job) => (
                  <JobCard key={job._id} job={job} onApply={() => navigate(applyUrl(job))} />
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No positions match your filters</p>
                    <p className="text-sm mt-1">Try broadening your search criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
