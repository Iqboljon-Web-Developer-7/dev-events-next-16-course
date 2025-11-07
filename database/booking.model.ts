import { Schema, model, models, type HydratedDocument, type Model, Types } from 'mongoose';
import { Event } from './event.model';

// Domain type for Booking documents (no `any`)
export interface Booking {
  eventId: Types.ObjectId; // reference to Event
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Basic email validator (conservative)
function isEmail(email: string): boolean {
  // Simplified but robust pattern for most emails
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

const BookingSchema = new Schema<Booking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: { validator: isEmail, message: 'Invalid email address' },
    },
  },
  {
    timestamps: true, // auto-manage createdAt/updatedAt
    versionKey: false,
  },
);

// Index on eventId for faster lookups
BookingSchema.index({ eventId: 1 });

// Pre-save: ensure referenced Event exists; email is validated by schema validator above.
BookingSchema.pre('save', async function (this: HydratedDocument<Booking>, next) {
  try {
    if (!this.eventId) throw new Error('eventId is required');

    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) throw new Error('Referenced event does not exist');

    next();
  } catch (err) {
    next(err as Error);
  }
});

export type BookingDocument = HydratedDocument<Booking>;

// Reuse existing model in hot-reload environments (Next.js)
export const Booking: Model<Booking> = (models.Booking as Model<Booking>) || model<Booking>('Booking', BookingSchema);
