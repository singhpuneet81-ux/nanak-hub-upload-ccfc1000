import React, { useState } from "react";
import {
  Bell, Calendar, Clock, Video, User, Users, CheckCircle2,
  ChevronRight, Mail, Phone, Building2, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useWebinars, registerForWebinar, type WebinarAPI } from "@/hooks/useWebinars";
import { format } from "date-fns";

/* ─── Countdown helper ─── */
function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCountdown(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days > 0) return `STARTS IN ${days} DAYS`;
  if (days === 0) return "TODAY";
  return "ENDED";
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "EEEE d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

/* ─── Webinar Card ─── */
const WebinarCard: React.FC<{ webinar: WebinarAPI; onRegister: (w: WebinarAPI) => void }> = ({
  webinar,
  onRegister,
}) => {
  const displayDate = formatDate(webinar.date);
  const imageBase = "https://api.cavaluer.com";

  return (
    <div className="bg-background rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
      <div className="flex flex-col lg:flex-row">
        {/* Left: visual panel */}
        <div className="relative bg-muted w-full lg:w-[320px] min-h-[220px] flex flex-col items-center justify-center p-6 shrink-0 overflow-hidden">
          {webinar.speakerImage && (
            <img
              src={`${imageBase}${webinar.speakerImage}`}
              alt={webinar.speaker}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <Badge className="absolute top-4 left-4 bg-background/20 text-cta-foreground border-cta-foreground/30 text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm z-10">
            ⚡ {formatCountdown(webinar.date)}
          </Badge>
          <div className="flex items-center gap-2 bg-foreground/80 text-background rounded-full px-4 py-2 text-sm font-medium mt-auto w-full max-w-[200px] z-10">
            <div className="w-6 h-6 rounded-full bg-cta flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-cta-foreground" />
            </div>
            <div className="truncate">
              <span>{webinar.speaker}</span>
              {webinar.speakerTitle && (
                <span className="block text-[10px] opacity-70">{webinar.speakerTitle}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="flex-1 p-5 md:p-6 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="rounded-full text-xs font-medium">
              {webinar.category}
            </Badge>
            {webinar.featured && (
              <Badge className="rounded-full text-xs bg-amber-100 text-amber-800 border-amber-300">
                ⭐ Featured
              </Badge>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> {displayDate}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {webinar.time} · {webinar.duration}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold mb-2">{webinar.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{webinar.description}</p>

          {webinar.learnings && webinar.learnings.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                🎯 <span>You'll Learn:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {webinar.learnings.map((l, i) => (
                  <span key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <Button
              onClick={() => onRegister(webinar)}
              className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-full px-6 h-10 font-semibold text-sm"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Register Now (Free)
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-foreground">{(webinar as any).registeredCount ?? webinar.registered ?? 0}</span> registered
              {webinar.maxSeats && (
                <span className="text-xs">/ {webinar.maxSeats} seats</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Registration Modal ─── */
const WebinarRegistrationModal: React.FC<{
  webinar: WebinarAPI | null;
  open: boolean;
  onClose: () => void;
}> = ({ webinar, open, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", company: "" });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinar) return;
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await registerForWebinar(webinar._id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      const isAlreadyRegistered = err.status === 409;
      toast({
        title: isAlreadyRegistered ? "Already Registered" : "Registration Failed",
        description: isAlreadyRegistered
          ? "You are already registered for this webinar. Check your email for the webinar link."
          : err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!webinar) return null;
  const displayDate = formatDate(webinar.date);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-cta flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-cta-foreground" />
          </div>
          <DialogHeader className="text-left mb-1">
            <DialogTitle className="text-xl font-bold">Register for Webinar</DialogTitle>
            <DialogDescription className="text-base font-semibold text-foreground mt-1">
              {webinar.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-5">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {displayDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {webinar.time}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {webinar.speaker}
            </span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="04XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Company / Organization</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Your company name"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Registration
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By registering, you'll receive a confirmation email with the webinar link and calendar invite. We respect your privacy.
              </p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.12)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">You're Registered!</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Check your email for the webinar link, calendar invite, and joining instructions.
              </p>
              <div className="bg-[hsl(var(--muted)/0.4)] rounded-xl p-4 text-left">
                <p className="text-sm font-bold mb-3">What's Next?</p>
                <div className="space-y-2.5">
                  {[
                    "Confirmation email sent with webinar link",
                    "Calendar invite added to your schedule",
                    "Reminder sent 24 hours before the webinar",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Page ─── */
const WebinarPage: React.FC = () => {
  const { webinars, loading, error } = useWebinars();
  const [selectedWebinar, setSelectedWebinar] = useState<WebinarAPI | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRegister = (webinar: WebinarAPI) => {
    setSelectedWebinar(webinar);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--muted)/0.3)]">
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="mb-3 rounded-full bg-[hsl(var(--foreground)/0.06)] text-foreground border-[hsl(var(--foreground)/0.15)] text-[10px] uppercase tracking-widest font-bold">
              <Bell className="w-3.5 h-3.5 mr-1" /> Register Now · Limited Seats
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black mt-3">Upcoming Webinars</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-base">
              Secure your spot in our exclusive educational sessions. Each webinar includes{" "}
              <span className="font-semibold text-foreground">live Q&A</span>,{" "}
              <span className="font-semibold text-cta">downloadable resources</span>, and{" "}
              <span className="font-semibold text-success">CPD points</span>.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-cta animate-spin mb-4" />
              <p className="text-muted-foreground">Loading webinars...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-destructive font-medium mb-2">Failed to load webinars</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && webinars.length === 0 && (
            <div className="text-center py-20">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Upcoming Webinars</h3>
              <p className="text-sm text-muted-foreground">Check back soon for new sessions!</p>
            </div>
          )}

          {/* Webinar Cards */}
          {!loading && !error && webinars.length > 0 && (
            <div className="space-y-5">
              {webinars.map((webinar) => (
                <WebinarCard key={webinar._id} webinar={webinar} onRegister={handleRegister} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WebinarRegistrationModal
        webinar={selectedWebinar}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default WebinarPage;
