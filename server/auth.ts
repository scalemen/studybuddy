import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import crypto from "crypto";
import type { Request, Response } from "express";

// Initialize passport and session handling
export function initializeAuth(app: any) {
  // Configure local strategy for passport
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Special demo user that always works
          if (email === "demo@example.com" && password === "demo") {
            let demoUser = await storage.getUserByEmail(email);
            
            if (!demoUser) {
              // Create demo user if it doesn't exist
              demoUser = await storage.createUser({
                username: "demo",
                email: "demo@example.com",
                password: hashPassword("demo"),
                displayName: "Demo User",
                photoUrl: null,
                googleId: null
              });
            }
            return done(null, demoUser);
          }
          
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password." });
          }
          
          // For users created with Google, password might be null
          if (!user.password) {
            return done(null, false, {
              message: "Please sign in with Google for this account.",
            });
          }
          
          // Simple password check
          if (user.password !== hashPassword(password)) {
            return done(null, false, { message: "Invalid email or password." });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Store user ID in the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Retrieve user from the storage
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Initialize passport and session handling
  app.use(passport.initialize());
  app.use(passport.session());
}

// Hash password (simplified version - in production use bcrypt or argon2)
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Mock Google authentication since we can't actually implement OAuth flow without proper credentials
export async function handleGoogleAuth(req: Request, res: Response) {
  const { email, name, googleId, photoUrl } = req.body;
  
  try {
    // Check if user already exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      user = await storage.createUser({
        username: email.split('@')[0],
        email,
        password: null,
        googleId,
        displayName: name,
        photoUrl
      });
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user = await storage.updateUser(user.id, {
          googleId,
          displayName: name,
          photoUrl
        });
      }
    }
    
    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Authentication failed" });
      }
      return res.json({ user });
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Check if user is authenticated middleware
export function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ authenticated: false });
}
