import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';

// Domain type for Event documents (no `any`)
export interface Event {
  title: string;
  slug: string; // unique, generated from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as 24h HH:mm
  mode: string; // e.g., online | offline | hybrid
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper: create a URL-friendly slug from title
function toSlug(input: string): string {
  return input
    .toString()
    .normalize('NFKD') // strip diacritics
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper: normalize a date-like string to ISO date (YYYY-MM-DD). Throws on invalid.
function normalizeDateToISODate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date format');
  }
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`; // ISO date only
}

// Helper: normalize time to 24-hour HH:mm. Accepts variants like "9:30", "9:30 am", "09:30PM".
function normalizeTimeToHHmm(timeStr: string): string {
  const m = timeStr.trim().match(/^([0-2]?\d):([0-5]\d)\s*([AaPp][Mm])?$/);
  if (!m) throw new Error('Invalid time format (expected HH:mm or h:mm am/pm)');
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const period = m[3]?.toLowerCase();

  if (period) {
    if (hours === 12) hours = 0; // 12am -> 00, 12pm handled below
    if (period === 'pm') hours += 12;
  }

  if (hours < 0 || hours > 23) throw new Error('Hour out of range');
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const EventSchema = new Schema<Event>(
  {
    title: { type: String, required: true, trim: true, minlength: 1 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true, minlength: 1 },
    overview: { type: String, required: true, trim: true, minlength: 1 },
    image: { type: String, required: true, trim: true, minlength: 1 },
    venue: { type: String, required: true, trim: true, minlength: 1 },
    location: { type: String, required: true, trim: true, minlength: 1 },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true, minlength: 1 },
    audience: { type: String, required: true, trim: true, minlength: 1 },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: unknown): boolean =>
          Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
        message: 'Agenda must be a non-empty array of non-empty strings',
      },
    },
    organizer: { type: String, required: true, trim: true, minlength: 1 },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: unknown): boolean =>
          Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
        message: 'Tags must be a non-empty array of non-empty strings',
      },
    },
  },
  {
    timestamps: true, // auto-manage createdAt/updatedAt
    versionKey: false,
  },
);

// Unique index for slug (redundant with slug field options, declared explicitly for clarity)
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save: generate slug on new/change of title; normalize date/time; basic non-empty validation.
EventSchema.pre('save', function (this: HydratedDocument<Event>, next) {
  try {
    // Ensure core string fields are present and non-empty after trim
    const requiredStringFields: Array<keyof Event> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];
    for (const key of requiredStringFields) {
      const val = String(this[key] ?? '').trim();
      if (!val) throw new Error(`${String(key)} is required`);
    }

    // Slug: only regenerate if title changed or slug missing
    if (this.isModified('title') || !this.slug) {
      this.slug = toSlug(this.title);
    }

    // Normalize date/time representations
    this.date = normalizeDateToISODate(this.date);
    this.time = normalizeTimeToHHmm(this.time);

    next();
  } catch (err) {
    next(err as Error);
  }
});

export type EventDocument = HydratedDocument<Event>;

// Reuse existing model in hot-reload environments (Next.js)
export const Event: Model<Event> = (models.Event as Model<Event>) || model<Event>('Event', EventSchema);
