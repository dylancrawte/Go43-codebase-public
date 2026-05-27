import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Booking = {
    _id: string;
    userId: string;
    campaignId: string;
};

type State = {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  hydrateBookings: () => Promise<void>;
};

export const useBookingsStore = create<State>((set) => ({
  bookings: [],
  setBookings: (bookings) => {
    set({ bookings });
    AsyncStorage.setItem('bookings', JSON.stringify(bookings));
  },
  addBooking: (booking) => {
    set((state) => {
      const updated = [booking, ...state.bookings];
      AsyncStorage.setItem('bookings', JSON.stringify(updated));
      return { bookings: updated };
    });
  },
  hydrateBookings: async () => {
    const data = await AsyncStorage.getItem('bookings');
    if (data) set({ bookings: JSON.parse(data) });
  },
}));