import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Keine gültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Mindestens 2 Zeichen').max(40, 'Maximal 40 Zeichen'),
    email: z.string().email('Keine gültige E-Mail-Adresse'),
    password: z
      .string()
      .min(8, 'Mindestens 8 Zeichen erforderlich')
      .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
      .regex(/[0-9]/, 'Mindestens eine Zahl'),
    confirmPassword: z.string(),
    phone:   z.string().optional(),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
