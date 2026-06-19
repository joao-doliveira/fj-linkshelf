import {
    pgTable,
    uuid,
    text,
    timestamp,
    unique,
    index,
  } from "drizzle-orm/pg-core";
  
  export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  });
  
  export const bookmarks = pgTable(
    "bookmarks",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      url: text("url").notNull(),
      title: text("title").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      unique("bookmarks_user_id_url_unique").on(table.userId, table.url),
      index("bookmarks_user_id_created_at_idx").on(
        table.userId,
        table.createdAt,
      ),
    ],
  );