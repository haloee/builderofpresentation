import { mysqlTable, varchar,text,mediumtext, datetime, primaryKey } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm"; // Helyes import az sql függvényhez

export const users=mysqlTable("users",{
	id: varchar("id",{length:36}).primaryKey(),
	username:varchar("username",{length:50}).notNull().unique(),
	email:varchar("email",{length:100}).notNull().unique(),
	password_hash:varchar("password_hash",{length:255}).notNull(),
});

export const presentations = mysqlTable("presentations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  imageFolderPath: text("image_folder_path").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const presentationPermissions = mysqlTable(
  "presentation_permissions",
  {
    presentationId: varchar("presentation_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    permission: varchar("permission", { length: 10 }).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.presentationId, table.userId),
  })
);
// Diák (slides) táblája
export const slides = mysqlTable("slides", {
	id: varchar("id", { length: 36 }).primaryKey(),
	presentationId: varchar("presentation_id", { length: 36 }).notNull(),
	content: text("content"),
	imagePath: mediumtext("imagePath"), // Új mező a képek tárolására
  });