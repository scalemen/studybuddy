import { 
  users, User, InsertUser,
  notes, Note, InsertNote,
  flashcardDecks, FlashcardDeck, InsertFlashcardDeck,
  flashcards, Flashcard, InsertFlashcard,
  homeworks, Homework, InsertHomework,
  topicSearches, TopicSearch, InsertTopicSearch
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Notes operations
  getNotesByUserId(userId: number): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Flashcard decks operations
  getFlashcardDecksByUserId(userId: number): Promise<FlashcardDeck[]>;
  getFlashcardDeckById(id: number): Promise<FlashcardDeck | undefined>;
  createFlashcardDeck(deck: InsertFlashcardDeck): Promise<FlashcardDeck>;
  updateFlashcardDeck(id: number, deck: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined>;
  deleteFlashcardDeck(id: number): Promise<boolean>;
  
  // Flashcards operations
  getFlashcardsByDeckId(deckId: number): Promise<Flashcard[]>;
  getFlashcardById(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  
  // Homework operations
  getHomeworksByUserId(userId: number): Promise<Homework[]>;
  getHomeworkById(id: number): Promise<Homework | undefined>;
  createHomework(homework: InsertHomework): Promise<Homework>;
  updateHomework(id: number, homework: Partial<Homework>): Promise<Homework | undefined>;
  deleteHomework(id: number): Promise<boolean>;
  
  // Topic search operations
  getTopicSearchesByUserId(userId: number): Promise<TopicSearch[]>;
  getTopicSearchById(id: number): Promise<TopicSearch | undefined>;
  createTopicSearch(search: InsertTopicSearch): Promise<TopicSearch>;
  updateTopicSearch(id: number, search: Partial<TopicSearch>): Promise<TopicSearch | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  private flashcardDecks: Map<number, FlashcardDeck>;
  private flashcards: Map<number, Flashcard>;
  private homeworks: Map<number, Homework>;
  private topicSearches: Map<number, TopicSearch>;
  
  private userId: number;
  private noteId: number;
  private deckId: number;
  private flashcardId: number;
  private homeworkId: number;
  private searchId: number;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.flashcardDecks = new Map();
    this.flashcards = new Map();
    this.homeworks = new Map();
    this.topicSearches = new Map();
    
    this.userId = 1;
    this.noteId = 1;
    this.deckId = 1;
    this.flashcardId = 1;
    this.homeworkId = 1;
    this.searchId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...userUpdate
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Notes methods
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.notes.set(id, note);
    return note;
  }
  
  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote: Note = { 
      ...note, 
      ...noteUpdate, 
      updatedAt: new Date() 
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Flashcard deck methods
  async getFlashcardDecksByUserId(userId: number): Promise<FlashcardDeck[]> {
    return Array.from(this.flashcardDecks.values()).filter(
      (deck) => deck.userId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getFlashcardDeckById(id: number): Promise<FlashcardDeck | undefined> {
    return this.flashcardDecks.get(id);
  }
  
  async createFlashcardDeck(insertDeck: InsertFlashcardDeck): Promise<FlashcardDeck> {
    const id = this.deckId++;
    const now = new Date();
    const deck: FlashcardDeck = { 
      ...insertDeck, 
      id, 
      createdAt: now
    };
    this.flashcardDecks.set(id, deck);
    return deck;
  }
  
  async updateFlashcardDeck(id: number, deckUpdate: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined> {
    const deck = this.flashcardDecks.get(id);
    if (!deck) return undefined;
    
    const updatedDeck: FlashcardDeck = { 
      ...deck, 
      ...deckUpdate
    };
    this.flashcardDecks.set(id, updatedDeck);
    return updatedDeck;
  }
  
  async deleteFlashcardDeck(id: number): Promise<boolean> {
    // Also delete all flashcards in this deck
    Array.from(this.flashcards.entries()).forEach(([cardId, card]) => {
      if (card.deckId === id) {
        this.flashcards.delete(cardId);
      }
    });
    return this.flashcardDecks.delete(id);
  }

  // Flashcard methods
  async getFlashcardsByDeckId(deckId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (card) => card.deckId === deckId
    );
  }
  
  async getFlashcardById(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }
  
  async createFlashcard(insertCard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardId++;
    const now = new Date();
    const card: Flashcard = { 
      ...insertCard, 
      id, 
      createdAt: now
    };
    this.flashcards.set(id, card);
    return card;
  }
  
  async updateFlashcard(id: number, cardUpdate: Partial<InsertFlashcard>): Promise<Flashcard | undefined> {
    const card = this.flashcards.get(id);
    if (!card) return undefined;
    
    const updatedCard: Flashcard = { 
      ...card, 
      ...cardUpdate
    };
    this.flashcards.set(id, updatedCard);
    return updatedCard;
  }
  
  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcards.delete(id);
  }

  // Homework methods
  async getHomeworksByUserId(userId: number): Promise<Homework[]> {
    return Array.from(this.homeworks.values()).filter(
      (homework) => homework.userId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getHomeworkById(id: number): Promise<Homework | undefined> {
    return this.homeworks.get(id);
  }
  
  async createHomework(insertHomework: InsertHomework): Promise<Homework> {
    const id = this.homeworkId++;
    const now = new Date();
    const homework: Homework = { 
      ...insertHomework, 
      id, 
      solution: null,
      createdAt: now
    };
    this.homeworks.set(id, homework);
    return homework;
  }
  
  async updateHomework(id: number, homeworkUpdate: Partial<Homework>): Promise<Homework | undefined> {
    const homework = this.homeworks.get(id);
    if (!homework) return undefined;
    
    const updatedHomework: Homework = { 
      ...homework, 
      ...homeworkUpdate
    };
    this.homeworks.set(id, updatedHomework);
    return updatedHomework;
  }
  
  async deleteHomework(id: number): Promise<boolean> {
    return this.homeworks.delete(id);
  }

  // Topic search methods
  async getTopicSearchesByUserId(userId: number): Promise<TopicSearch[]> {
    return Array.from(this.topicSearches.values()).filter(
      (search) => search.userId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getTopicSearchById(id: number): Promise<TopicSearch | undefined> {
    return this.topicSearches.get(id);
  }
  
  async createTopicSearch(insertSearch: InsertTopicSearch): Promise<TopicSearch> {
    const id = this.searchId++;
    const now = new Date();
    const search: TopicSearch = { 
      ...insertSearch, 
      id, 
      summary: null,
      createdAt: now
    };
    this.topicSearches.set(id, search);
    return search;
  }
  
  async updateTopicSearch(id: number, searchUpdate: Partial<TopicSearch>): Promise<TopicSearch | undefined> {
    const search = this.topicSearches.get(id);
    if (!search) return undefined;
    
    const updatedSearch: TopicSearch = { 
      ...search, 
      ...searchUpdate
    };
    this.topicSearches.set(id, updatedSearch);
    return updatedSearch;
  }
}

export const storage = new MemStorage();
