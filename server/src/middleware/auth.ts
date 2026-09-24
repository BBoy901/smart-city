import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: Role[];
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive account" });
    }
    req.user = { id: user.id, email: user.email, roles: user.roles };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();

  try {
    const payload = verifyToken(header.slice(7));
    req.user = {
      id: payload.userId,
      email: payload.email,
      roles: payload.roles as any,
    };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ error: "Authentication required" });
    if (!roles.some((r) => req.user!.roles.includes(r))) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}


export async function requireApprovedSeller(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      select: { approvalStatus: true },
    });

    if (!sellerProfile) {
      return res.status(403).json({
        error: "Seller profile not found",
      });
    }

    const status = sellerProfile.approvalStatus;

    if (status !== "APPROVED") {
      const error =
        status === "PENDING"
          ? "Your seller account is pending admin approval"
          : status === "REJECTED"
            ? "Your seller application has been rejected"
            : "Your seller account is not approved";

      return res.status(403).json({
        error,
        approvalStatus: status,
      });
    }

    return next();
  } catch (error) {
    console.error("Seller approval check failed:", error);

    return res.status(500).json({
      error: "Failed to verify seller approval",
    });
  }
}
