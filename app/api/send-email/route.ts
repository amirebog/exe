import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import {
  redis,
  incrementEmailCount,
  incrementRoleCount,
  saveContact,
  getClientIp,
} from "@/lib/redis";
import { validateEmail, sanitizeEmail } from "@/lib/validators";
import { notifyNewContact } from "@/lib/telegram-bot";
import { verifyTurnstile } from "@/lib/turnstile";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1h"),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success: rateLimitSuccess } = await ratelimit.limit(ip);
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, contact, role, timestamp, turnstileToken } = body;

    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken || typeof turnstileToken !== "string") {
        return NextResponse.json(
          { error: "Captcha verification required" },
          { status: 400 }
        );
      }
      const captchaOk = await verifyTurnstile(turnstileToken, ip);
      if (!captchaOk) {
        return NextResponse.json(
          { error: "Captcha verification failed" },
          { status: 400 }
        );
      }
    }

    if (!timestamp || typeof timestamp !== "number") {
      return NextResponse.json(
        { error: "Invalid request: missing timestamp" },
        { status: 400 }
      );
    }
    if (Date.now() - timestamp < 3000) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please take your time." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    const sanitizedEmail = sanitizeEmail(email.trim());
    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!contact || typeof contact !== "string" || contact.trim().length < 3) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Telegram ID or phone number (min 3 characters)",
        },
        { status: 400 }
      );
    }
    const trimmedContact = contact.trim();

    const validRoles = ["Founder", "Designer", "Developer", "Investor"];
    if (!role || typeof role !== "string" || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Please select a valid role" },
        { status: 400 }
      );
    }

    await Promise.all([
      saveContact(sanitizedEmail, trimmedContact, role),
      incrementEmailCount(),
      incrementRoleCount(role),
    ]);

    await notifyNewContact({
      email: sanitizedEmail,
      contact: trimmedContact,
      role,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
