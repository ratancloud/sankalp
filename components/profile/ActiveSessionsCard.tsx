"use client";

import { useState } from "react";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut, Laptop, Smartphone, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formateIndDate } from "@/lib/helper";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Session = typeof authClient.$Infer.Session.session;

interface ActiveSessionsCardProps {
  currentSessionId: string;
}

export default function ActiveSessionsCard({ currentSessionId }: ActiveSessionsCardProps) {
  const { data: sessions = [], isLoading: loading, mutate } = useSWR<Session[]>(
    "sessions",
    async () => {
      const res = await authClient.listSessions();
      return res.data || [];
    }
  );
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const revokeSession = async (token: string, id: string) => {
    setRevokingId(id);
    
    // Optimistic Update
    mutate(
      sessions.filter((s) => s.id !== id),
      false
    );

    const { error } = await authClient.revokeSession({ token });
    setRevokingId(null);

    if (error) {
      mutate(); // Rollback
      return toast.error(error.message || "Failed to revoke");
    }

    mutate(); // Sync
    toast.success("Session revoked");
  };

  return (
    <Card className="rounded-xl border border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
        </div>
        <CardDescription>Manage devices where you are currently logged in.</CardDescription>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto max-h-100">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active sessions found.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {sessions.map((s) => {
              const isCurrent = s.id === currentSessionId;
              const isMobile = /Android|iPhone|iPad|Mobi/i.test(s.userAgent || "");
              
              // Simple browser detection
              const browser = s.userAgent?.includes("Chrome") ? "Chrome" 
                : s.userAgent?.includes("Firefox") ? "Firefox" 
                : s.userAgent?.includes("Safari") ? "Safari" 
                : s.userAgent?.includes("Edg") ? "Edge" 
                : "Unknown Browser";

              return (
                <div key={s.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {isMobile ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {isMobile ? "Mobile App" : `${browser} on Desktop`}
                        </p>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/15">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                         IP: {s.ipAddress || "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Exp: {formateIndDate(s.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => revokeSession(s.token, s.id)}
                      disabled={revokingId === s.id}
                      title="Revoke Session"
                    >
                      {revokingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}