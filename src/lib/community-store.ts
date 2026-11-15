export type Post = {
  id: string;
  pseudo: string;
  avatarSeed: number;
  text: string;
  date: string;
  hearts: number;
  heartedByMe?: boolean;
};

const KEY = "stellar-pulse.community.v1";

const ADJECTIVES = [
  "Wave",
  "Bird",
  "Mist",
  "Morning",
  "Moon",
  "Lighthouse",
  "Sand",
  "Cedar",
  "Green",
  "Thunder",
  "Rose",
  "Stone",
  "Rain",
  "Tree",
  "Wind",
  "Forest",
];
const NOUNS = [
  "Calm",
  "Sweet",
  "Tender",
  "Patient",
  "Bright",
  "Silent",
  "Rested",
  "Alive",
  "Light",
  "Steady",
  "Present",
  "Friend",
];

const SEED_POSTS: Omit<Post, "id" | "date">[] = [
  {
    pseudo: "WaveCalm",
    avatarSeed: 12,
    text: "Today is 3 days without weed, hard but patient. Thanks to those who share here.",
    hearts: 14,
  },
  {
    pseudo: "BirdSweet",
    avatarSeed: 47,
    text: "Tonight the craving was strong. I did square breathing and it passed. I am proud of myself.",
    hearts: 22,
  },
  {
    pseudo: "LighthousePatient",
    avatarSeed: 88,
    text: "Reminder to myself: one relapse doesn't erase everything I built.",
    hearts: 31,
  },
  {
    pseudo: "MistLight",
    avatarSeed: 23,
    text: "First week without drugs. I sleep the same but breathe better.",
    hearts: 18,
  },
  {
    pseudo: "StoneSteady",
    avatarSeed: 5,
    text: "Anyone else have a problem on Sunday night? That's my hardest time.",
    hearts: 9,
  },
  {
    pseudo: "MorningRested",
    avatarSeed: 61,
    text: "Today I said «no» to a friend who offered. My hands were shaking but I did it.",
    hearts: 27,
  },
  {
    pseudo: "TreeTender",
    avatarSeed: 34,
    text: "We forget: believing in yourself is bravery.",
    hearts: 15,
  },
  {
    pseudo: "GreenSweet",
    avatarSeed: 76,
    text: "Went back to sports this morning, just 15 minutes. It's a start.",
    hearts: 12,
  },
  {
    pseudo: "ThunderPresent",
    avatarSeed: 18,
    text: "Craving hit me lightly in the market. I put down the basket, went out, cried in the car. But I didn't buy.",
    hearts: 41,
  },
  {
    pseudo: "RoseAlive",
    avatarSeed: 92,
    text: "Thanks for this place. Knowing I'm not alone changes everything.",
    hearts: 20,
  },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makePseudo() {
  return `${rand(ADJECTIVES)}${rand(NOUNS)}`;
}

function ensureSeed(): Post[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fallthrough */
    }
  }
  const now = Date.now();
  const seeded: Post[] = SEED_POSTS.map((p, i) => ({
    ...p,
    id: `seed-${i}`,
    date: new Date(now - (i + 1) * 1000 * 60 * 60 * (2 + i)).toISOString(),
  }));
  window.localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

export function getPosts(): Post[] {
  return ensureSeed();
}

export function addPost(text: string): Post {
  const post: Post = {
    id: `p-${Date.now()}`,
    pseudo: makePseudo(),
    avatarSeed: Math.floor(Math.random() * 1000),
    text: text.trim(),
    date: new Date().toISOString(),
    hearts: 0,
  };
  const next = [post, ...getPosts()].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return post;
}

export function toggleHeart(id: string): Post[] {
  const posts = getPosts().map((p) =>
    p.id === id
      ? {
          ...p,
          heartedByMe: !p.heartedByMe,
          hearts: p.hearts + (p.heartedByMe ? -1 : 1),
        }
      : p,
  );
  window.localStorage.setItem(KEY, JSON.stringify(posts));
  return posts;
}

export function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
