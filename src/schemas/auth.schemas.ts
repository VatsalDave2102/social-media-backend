import * as z from 'zod';

const authSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  bio: z.string().min(1, { message: 'Bio must be at least 1 character long' }).optional(),
});

export const userRegistrationSchema = authSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
);

export const userLoginSchema = authSchema.pick({
  email: true,
  password: true,
});

export const forgotPasswordSchema = authSchema.pick({
  email: true,
});

export const resetPasswordSchema = authSchema
  .pick({
    password: true,
    confirmPassword: true,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
