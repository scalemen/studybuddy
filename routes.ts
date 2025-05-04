import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, initializeAuth, hashPassword, handleGoogleAuth } from "./auth";
import { summarizeTopic, analyzeHomeworkImage, generateTopicQuiz, generateFlashcards } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import passport from "passport";
import { 
  insertUserSchema, 
  insertNoteSchema, 
  insertFlashcardDeckSchema, 
  insertFlashcardSchema,
  insertHomeworkSchema,
  insertTopicSearchSchema
} from "@shared/schema";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize authentication
  initializeAuth(app);
  
  // Auth routes
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({ authenticated: true, user: req.user });
    }
    return res.status(401).json({ authenticated: false });
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info.message });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ user });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.safeParse(req.body);
      
      if (!userData.success) {
        return res.status(400).json({ error: "Invalid user data" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      // Hash password
      const user = await storage.createUser({
        ...userData.data,
        password: hashPassword(userData.data.password || ""),
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  app.post("/api/auth/google", async (req, res) => {
    await handleGoogleAuth(req, res);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
  

  
  // Notes API
  app.get("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const notes = await storage.getNotesByUserId(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });
  
  app.get("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      // Verify user owns this note
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });
  
  app.post("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const noteData = insertNoteSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!noteData.success) {
        return res.status(400).json({ error: "Invalid note data" });
      }
      
      const note = await storage.createNote(noteData.data);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to create note" });
    }
  });
  
  app.put("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      // Verify user owns this note
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updatedNote = await storage.updateNote(noteId, req.body);
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });
  
  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      // Verify user owns this note
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await storage.deleteNote(noteId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });
  
  // Flashcard decks API
  app.get("/api/flashcard-decks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const decks = await storage.getFlashcardDecksByUserId(userId);
      res.json(decks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcard decks" });
    }
  });
  
  app.get("/api/flashcard-decks/:id", isAuthenticated, async (req, res) => {
    try {
      const deckId = parseInt(req.params.id);
      const deck = await storage.getFlashcardDeckById(deckId);
      
      if (!deck) {
        return res.status(404).json({ error: "Flashcard deck not found" });
      }
      
      // Verify user owns this deck
      if (deck.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      res.json(deck);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcard deck" });
    }
  });
  
  app.post("/api/flashcard-decks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const deckData = insertFlashcardDeckSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!deckData.success) {
        return res.status(400).json({ error: "Invalid flashcard deck data" });
      }
      
      const deck = await storage.createFlashcardDeck(deckData.data);
      res.status(201).json(deck);
    } catch (error) {
      res.status(500).json({ error: "Failed to create flashcard deck" });
    }
  });
  
  // Flashcards API
  app.get("/api/flashcard-decks/:deckId/cards", isAuthenticated, async (req, res) => {
    try {
      const deckId = parseInt(req.params.deckId);
      const deck = await storage.getFlashcardDeckById(deckId);
      
      if (!deck) {
        return res.status(404).json({ error: "Flashcard deck not found" });
      }
      
      // Verify user owns this deck
      if (deck.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const cards = await storage.getFlashcardsByDeckId(deckId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });
  
  app.post("/api/flashcard-decks/:deckId/cards", isAuthenticated, async (req, res) => {
    try {
      const deckId = parseInt(req.params.deckId);
      const deck = await storage.getFlashcardDeckById(deckId);
      
      if (!deck) {
        return res.status(404).json({ error: "Flashcard deck not found" });
      }
      
      // Verify user owns this deck
      if (deck.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const cardData = insertFlashcardSchema.safeParse({
        ...req.body,
        deckId,
      });
      
      if (!cardData.success) {
        return res.status(400).json({ error: "Invalid flashcard data" });
      }
      
      const card = await storage.createFlashcard(cardData.data);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to create flashcard" });
    }
  });
  
  // Homework helper API
  app.get("/api/homeworks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const homeworks = await storage.getHomeworksByUserId(userId);
      res.json(homeworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch homeworks" });
    }
  });
  
  app.get("/api/homeworks/:id", isAuthenticated, async (req, res) => {
    try {
      const homeworkId = parseInt(req.params.id);
      const homework = await storage.getHomeworkById(homeworkId);
      
      if (!homework) {
        return res.status(404).json({ error: "Homework not found" });
      }
      
      // Verify user owns this homework
      if (homework.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      res.json(homework);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch homework" });
    }
  });
  
  app.post("/api/homeworks/upload", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      const userId = (req.user as any).id;
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Homework title is required" });
      }
      
      // Convert image to base64
      const base64Image = req.file.buffer.toString("base64");
      
      // Try to get analysis from OpenAI with fallback mechanism
      let problem = "Could not analyze the problem due to API limitations.";
      let solution = "Solution not available due to API limitations. Please try again later or contact support.";
      
      try {
        // This will use our fallback if OpenAI API fails
        const analysis = await analyzeHomeworkImage(base64Image, title);
        problem = analysis.problem;
        solution = analysis.solution;
      } catch (error) {
        console.error("Homework analysis failed completely:", error);
        // We'll continue with the default problem/solution text
      }
      
      // Create homework record with whatever we have
      const homework = await storage.createHomework({
        userId,
        title,
        problem,
        imageUrl: `data:${req.file.mimetype};base64,${base64Image}`
      });
      
      // Update with solution
      const updatedHomework = await storage.updateHomework(homework.id, { solution });
      
      return res.status(201).json(updatedHomework);
    } catch (error) {
      console.error("Homework upload error:", error);
      res.status(500).json({ error: "Failed to process homework" });
    }
  });
  
  // Topic search API
  app.post("/api/topic-search", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      // Create search record first so we return something to the client
      const search = await storage.createTopicSearch({
        userId,
        topic
      });
      
      try {
        // Get summary from OpenAI (this will use our fallback if needed)
        const summary = await summarizeTopic(topic);
        
        // Update with summary
        const updatedSearch = await storage.updateTopicSearch(search.id, { summary });
        
        // Return the updated search
        return res.json(updatedSearch);
      } catch (error) {
        console.error("Topic summary error:", error);
        
        // Even if we fail to get a summary, we should return the search object
        // Our OpenAI service has fallbacks for when API quota is exceeded
        return res.json(search);
      }
    } catch (error) {
      console.error("Topic search error:", error);
      res.status(500).json({ error: "Failed to search topic" });
    }
  });
  
  app.get("/api/topic-searches", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const searches = await storage.getTopicSearchesByUserId(userId);
      res.json(searches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topic searches" });
    }
  });
  
  // Topic quiz API
  app.post("/api/topic-quiz", isAuthenticated, async (req, res) => {
    try {
      const { topic, numQuestions } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      // Generate quiz questions from OpenAI or use fallback
      try {
        const quizData = await generateTopicQuiz(topic, numQuestions || 5);
        res.json(quizData);
      } catch (error) {
        console.error("OpenAI quiz generation failed, using fallback:", error);
        // If OpenAI fails, use our fallback directly (reuse code from openai.ts)
        const fallbackQuiz = await generateTopicQuiz(topic, numQuestions || 5);
        res.json(fallbackQuiz);
      }
    } catch (error) {
      console.error("Topic quiz generation error:", error);
      res.status(500).json({ error: "Failed to generate quiz. Please try again later." });
    }
  });
  
  // Flashcard generation API
  app.post("/api/generate-flashcards", isAuthenticated, async (req, res) => {
    try {
      const { topic, count } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      // Generate flashcards using OpenAI or fallback
      try {
        const flashcards = await generateFlashcards(topic, count || 5);
        
        // Create flashcard deck first
        const userId = (req.user as any).id;
        const deck = await storage.createFlashcardDeck({
          userId,
          title: `${topic} Flashcards`,
          description: `Auto-generated flashcards for ${topic}`
        });
        
        // Add the flashcards to the deck
        const savedFlashcards = await Promise.all(
          flashcards.map(card => 
            storage.createFlashcard({
              deckId: deck.id,
              front: card.front,
              back: card.back
            })
          )
        );
        
        // Return the deck with its flashcards
        res.json({
          deck,
          flashcards: savedFlashcards
        });
      } catch (error) {
        console.error("Flashcard generation error:", error);
        res.status(500).json({ error: "Failed to generate flashcards. Please try again later." });
      }
    } catch (error) {
      console.error("Flashcard creation error:", error);
      res.status(500).json({ error: "Failed to create flashcards. Please try again later." });
    }
  });

  return httpServer;
}
