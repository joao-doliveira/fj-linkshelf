import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { bookmarks, users } from "./schema";

// Idempotency: truncate + insert (destructive — resets users & bookmarks every run)
config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  // Clear existing data (bookmarks first is optional — CASCADE handles user delete)
  await db.delete(bookmarks);
  await db.delete(users);

  const insertedUsers = await db
    .insert(users)
    .values([
      { email: "alice@study.dev", displayName: "Alice" },
      { email: "bob@study.dev", displayName: "Bob" },
      { email: "carol@study.dev", displayName: "Carol" },
    ])
    .returning();

  const byEmail = Object.fromEntries(
    insertedUsers.map((user) => [user.email, user]),
  );

  const alice = byEmail["alice@study.dev"];
  const bob = byEmail["bob@study.dev"];
  const carol = byEmail["carol@study.dev"];

  // Skewed counts: Alice 10, Bob 6, Carol 2 — good for stats demos
  await db.insert(bookmarks).values([
    // Alice (10)
    {
      userId: alice.id,
      url: "https://nextjs.org/docs",
      title: "Next.js Docs",
      notes: "App Router reference",
    },
    {
      userId: alice.id,
      url: "https://orm.drizzle.team/docs/overview",
      title: "Drizzle ORM",
    },
    {
      userId: alice.id,
      url: "https://www.postgresql.org/docs/",
      title: "PostgreSQL Docs",
    },
    {
      userId: alice.id,
      url: "https://tailwindcss.com/docs",
      title: "Tailwind CSS",
    },
    {
      userId: alice.id,
      url: "https://github.com/drizzle-team/drizzle-orm",
      title: "Drizzle on GitHub",
    },
    {
      userId: alice.id,
      url: "https://react.dev/reference/react",
      title: "React Reference",
    },
    {
      userId: alice.id,
      url: "https://www.typescriptlang.org/docs/",
      title: "TypeScript Handbook",
    },
    {
      userId: alice.id,
      url: "https://nodejs.org/en/docs",
      title: "Node.js Docs",
    },
    {
      userId: alice.id,
      url: "https://zod.dev/",
      title: "Zod",
      notes: "Validation for Step 5+",
    },
    {
      userId: alice.id,
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
      title: "HTTP Status Codes",
    },

    // Bob (6)
    {
      userId: bob.id,
      url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
      title: "Route Handlers",
    },
    {
      userId: bob.id,
      url: "https://www.prisma.io/docs",
      title: "Prisma Docs",
      notes: "Compare with Drizzle in interviews",
    },
    {
      userId: bob.id,
      url: "https://cheatsheetseries.owasp.org/",
      title: "OWASP Cheat Sheets",
    },
    {
      userId: bob.id,
      url: "https://12factor.net/",
      title: "The Twelve-Factor App",
    },
    {
      userId: bob.id,
      url: "https://martinfowler.com/articles/microservices.html",
      title: "Microservices",
    },
    {
      userId: bob.id,
      url: "https://redis.io/docs/",
      title: "Redis Docs",
    },

    // Carol (2)
    {
      userId: carol.id,
      url: "https://excalidraw.com/",
      title: "Excalidraw",
      notes: "Whiteboard for system design",
    },
    {
      userId: carol.id,
      url: "https://www.notion.so/",
      title: "Notion",
    },
  ]);

  console.log("Seed complete:");
  console.log(`  users: ${insertedUsers.length}`);
  console.log("  bookmarks: Alice 10, Bob 6, Carol 2");

  await client.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});