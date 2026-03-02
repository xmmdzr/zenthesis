"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SharedDocResolvePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const invalidToken = !token;

  useEffect(() => {
    let active = true;
    if (invalidToken) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const response = await fetch(`/api/shared/${token}`, { cache: "no-store" }).catch(() => null);

      if (!active) {
        return;
      }

      if (!response) {
        setError("network error");
        return;
      }

      if (response.status === 401) {
        router.replace(`/auth/login?next=${encodeURIComponent(`/app/shared/${token}`)}`);
        return;
      }

      if (!response.ok) {
        setError("invalid or expired share link");
        return;
      }

      const result = (await response.json()) as { docId: string };
      router.replace(`/app/docs/${result.docId}`);
    })();

    return () => {
      active = false;
    };
  }, [invalidToken, router, token]);

  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <p className="text-sm text-[color:var(--muted-foreground)]">
        {invalidToken ? "Share link error: invalid share token" : error ? `Share link error: ${error}` : "Resolving shared document..."}
      </p>
    </div>
  );
}
