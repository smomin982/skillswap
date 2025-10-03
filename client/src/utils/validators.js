import * as Yup from 'yup';

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const profileValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  bio: Yup.string()
    .max(500, 'Bio must be less than 500 characters'),
  location: Yup.object({
    city: Yup.string(),
    country: Yup.string(),
  }),
  timezone: Yup.string(),
});

export const skillValidationSchema = Yup.object({
  name: Yup.string()
    .required('Skill name is required'),
  level: Yup.string()
    .oneOf(['beginner', 'intermediate', 'advanced', 'expert'], 'Invalid skill level')
    .required('Skill level is required'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
});

export const exchangeValidationSchema = Yup.object({
  recipientId: Yup.string()
    .required('Recipient is required'),
  requesterSkill: Yup.object({
    name: Yup.string().required('Your skill is required'),
    level: Yup.string().required('Skill level is required'),
  }),
  recipientSkill: Yup.object({
    name: Yup.string().required('Desired skill is required'),
    level: Yup.string().required('Skill level is required'),
  }),
  duration: Yup.number()
    .min(1, 'Duration must be at least 1 week')
    .max(52, 'Duration must be less than 52 weeks')
    .required('Duration is required'),
  frequency: Yup.string()
    .oneOf(['once', 'weekly', 'bi-weekly', 'monthly'], 'Invalid frequency')
    .required('Frequency is required'),
  notes: Yup.string()
    .max(1000, 'Notes must be less than 1000 characters'),
});

export const sessionValidationSchema = Yup.object({
  scheduledDate: Yup.date()
    .min(new Date(), 'Session must be scheduled in the future')
    .required('Date is required'),
  duration: Yup.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours')
    .required('Duration is required'),
  type: Yup.string()
    .oneOf(['virtual', 'in-person'], 'Invalid session type')
    .required('Session type is required'),
  location: Yup.string()
    .when('type', {
      is: 'virtual',
      then: (schema) => schema.url('Must be a valid URL'),
    }),
  agenda: Yup.string()
    .max(500, 'Agenda must be less than 500 characters'),
});

export const reviewValidationSchema = Yup.object({
  rating: Yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .required('Rating is required'),
  comment: Yup.string()
    .max(500, 'Comment must be less than 500 characters'),
  categories: Yup.object({
    communication: Yup.number().min(1).max(5),
    knowledge: Yup.number().min(1).max(5),
    patience: Yup.number().min(1).max(5),
    reliability: Yup.number().min(1).max(5),
  }),
});

export const messageValidationSchema = Yup.object({
  content: Yup.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});
