import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phoneNumber: string;
        role: string;
      };
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Get phone number from header (sent by Firebase authenticated frontend)
    const phoneNumber = req.headers['x-user-phone'] as string;
    
    if (!phoneNumber) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get or create user
    let user = await storage.getUserByPhone(phoneNumber);
    
    if (!user) {
      // Auto-create user on first login
      user = await storage.createUser({
        phoneNumber,
        role: "customer"
      });
    }

    req.user = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
