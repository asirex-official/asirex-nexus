import { z } from "zod";

// Common passwords that are frequently hacked
const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "shadow", "123123", "654321", "superman", "qazwsx",
  "michael", "football", "password1", "password123", "welcome", "welcome1",
  "admin", "login", "passw0rd", "starwars", "hello", "charlie", "donald",
  "password1234", "qwerty123", "1q2w3e4r", "zaq12wsx", "asirex", "asirex123"
];

// Check if password contains sequential characters
const hasSequentialChars = (password: string): boolean => {
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "zyxwvutsrqponmlkjihgfedcba",
    "0123456789",
    "9876543210",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm"
  ];
  
  const lowerPass = password.toLowerCase();
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lowerPass.includes(seq.substring(i, i + 4))) {
        return true;
      }
    }
  }
  return false;
};

// Check for repeated characters
const hasRepeatedChars = (password: string): boolean => {
  return /(.)\1{2,}/.test(password);
};

// Strong password schema
export const strongPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(20, "Password must be less than 20 characters");

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters")
  .transform((email) => email.toLowerCase().trim());

// PIN validation (6 digits, no sequential or repeated)
export const pinSchema = z
  .string()
  .length(6, "PIN must be exactly 6 digits")
  .regex(/^\d{6}$/, "PIN must contain only numbers")
  .refine(
    (pin) => !hasSequentialChars(pin),
    "PIN cannot contain sequential numbers (123456)"
  )
  .refine(
    (pin) => !hasRepeatedChars(pin),
    "PIN cannot contain repeated digits (111111)"
  )
  .refine(
    (pin) => !["000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999"].includes(pin),
    "This PIN is too simple"
  );

// Auth form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  dateOfBirth: z.string().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

// Calculate password strength score (0-100)
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 6) score += 10;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
  if (!hasSequentialChars(password)) score += 5;
  if (!hasRepeatedChars(password)) score += 5;
  if (!COMMON_PASSWORDS.includes(password.toLowerCase())) score += 5;
  
  // Penalize short passwords
  if (password.length < 6) score = Math.min(score, 30);
  
  return Math.min(score, 100);
};

export const getPasswordStrengthLabel = (score: number): { label: string; color: string } => {
  if (score < 30) return { label: "Very Weak", color: "text-red-500" };
  if (score < 50) return { label: "Weak", color: "text-orange-500" };
  if (score < 70) return { label: "Fair", color: "text-yellow-500" };
  if (score < 90) return { label: "Strong", color: "text-green-500" };
  return { label: "Very Strong", color: "text-emerald-500" };
};
