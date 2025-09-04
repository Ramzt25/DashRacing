export interface Meet {
  id: string;
  hostId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  radiusMeters: number;
  visibility: 'public' | 'private' | 'club';
  rules?: string;
  maxAttendees?: number;
  verified: boolean;
  attendeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeetAttendee {
  meetId: string;
  userId: string;
  rsvp: 'going' | 'interested';
  checkedIn: boolean;
  createdAt: string;
}

export interface MeetUpdate {
  id: string;
  meetId: string;
  hostId: string;
  message: string;
  type: 'announcement' | 'weather_update' | 'location_change' | 'cancellation';
  createdAt: string;
}