import mongoose, { Document, Model, Schema } from 'mongoose'

// TypeScript interface for Event document
export interface IEvent extends Document {
  _id: string
  eventName: string
  eventType: 'class' | 'camp' | 'workshop'
  description: string
  price: number
  quantity: number
  dates: {
    startDate: Date
    endDate?: Date
    isRecurring: boolean
    recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    recurringEndDate?: Date
    excludeDates?: Date[]
    specificDates?: Date[]
  }
  time: {
    startTime: string
    endTime?: string
    timezone: string
  }
  image?: string
  createdAt: Date
  updatedAt: Date
}

// Define subdocument schemas
const EventDatesSchema = new Schema({
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    recurringEndDate: {
      type: Date,
    },
    excludeDates: [{
      type: Date,
    }],
    specificDates: [{
      type: Date,
    }],
  })

  const EventTimeSchema = new Schema({
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  })
  
  // Main Event schema
  const EventSchema = new Schema<IEvent>(
    {
      eventName: {
        type: String,
        required: true,
        trim: true,
      },
      eventType: {
        type: String,
        required: true,
        enum: ['class', 'camp', 'workshop'],
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      dates: {
        type: EventDatesSchema,
        required: true,
      },
      time: {
        type: EventTimeSchema,
        required: true,
      },
      image: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  )
  
  // Index for efficient searching
  EventSchema.index({ 'dates.startDate': 1, eventType: 1 })
  
  // Static method to test connection
  EventSchema.statics.testConnection = function() {
    return this.findOne().limit(1)
  }
  
  // Prevent duplicate models in development
  const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
  
  export default Event
  

