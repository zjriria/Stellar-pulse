import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Plus, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AbstractAvatar } from "@/components/AbstractAvatar";
import { addPost, formatRelative, getPosts, toggleHeart, type Post } from "@/lib/community-store";

export const Route = createFileRoute("/communaute")({
  head: () => ({
    meta: [
      { title: "Community — Stellar Pulse" },
      {
        name: "description",
        content: "Anonymous thread of thoughts, victories, and support.",
      },
    ],
  }),
  component: CommunauteScreen,
});

function CommunauteScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setPosts(getPosts());
  }, []);

  const onLike = (id: string) => setPosts(toggleHeart(id));

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    addPost(t);
    setPosts(getPosts());
    setText("");
    setOpen(false);
  };

  return (
    <main className="mesh-bg mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-28 pt-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Community</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
          You are not alone.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          100% anonymous thread. No names, no photos — just voices.
        </p>
      </header>

      <ul className="mt-6 space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="glass rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <AbstractAvatar seed={p.avatarSeed} size={40} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.pseudo}</p>
                <p className="text-[11px] text-muted-foreground">{formatRelative(p.date)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{p.text}</p>
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={() => onLike(p.id)}
                aria-label="Send support"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                  p.heartedByMe
                    ? "bg-ocean/15 text-ocean"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${p.heartedByMe ? "fill-ocean" : ""}`} />
                {p.hearts}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-ocean px-5 text-sm font-semibold text-ocean-foreground shadow-[0_15px_40px_-10px_var(--ocean)] transition active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Share a thought
      </button>

      <BottomNav />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share a thought"
          className="fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur sm:items-center sm:justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Anonymous</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-2 text-xl font-semibold">What you're going through…</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              No name, no personal trace. A pseudonym and avatar will be assigned to you without
              tracking.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Today, I did…"
              rows={4}
              maxLength={500}
              className="mt-4 w-full rounded-2xl bg-foreground/5 p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="mt-3 min-h-[56px] w-full rounded-2xl bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98] disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
