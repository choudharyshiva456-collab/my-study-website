import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, notesTable, insertNoteSchema } from "@workspace/db";

const router: IRouter = Router();

// सभी notes प्राप्त करना
router.get("/notes", async (_req, res) => {
  try {
    const notes = await db
      .select()
      .from(notesTable)
      .orderBy(desc(notesTable.createdAt));

    res.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// नया note save करना
router.post("/notes", async (req, res) => {
  try {
    const note = insertNoteSchema.parse({
      ...req.body,
      id: crypto.randomUUID(),
    });

    const [createdNote] = await db
      .insert(notesTable)
      .values(note)
      .returning();

    res.status(201).json(createdNote);
  } catch (error) {
    console.error("Failed to create note:", error);
    res.status(400).json({ error: "Failed to create note" });
  }
});

// note delete करना
router.delete("/notes/:id", async (req, res) => {
  try {
    await db
      .delete(notesTable)
      .where(eq(notesTable.id, req.params.id));

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
