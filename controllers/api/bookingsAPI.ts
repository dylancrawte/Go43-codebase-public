import { Campaign } from "@/app/types";

export class bookingsAPI {
    private static readonly BOOKING_API_ENDPOINT = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings`

    // data transformation - backend
    static transformBookingsData(bookings: any[]) {
        const bookingsMap: { [key: string]: Campaign } = {};
        const bookingIdsMap: { [key: string]: string } = {};
        const bookingStatusMap: { [key: string]: string } = {};

        bookings.forEach((booking) => {
            if (booking.campaignID) {
                const campaignId = booking.campaignID._id || booking.campaignID;
                bookingsMap[campaignId] = booking.campaignID;
                bookingIdsMap[campaignId] = booking._id;
                bookingStatusMap[campaignId] = booking.status;
            }
        });

        return {
            bookingsMap,
            bookingIdsMap,
            bookingStatusMap
        };
    }

    static async createBookingAPI(userID: string, campaignID: string, status: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID,
                    campaignID,
                    status
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.booking,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to create booking"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async deleteBookingAPI(bookingID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/${bookingID}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.message,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to cancel booking"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async fetchBookingsByUserAPI(userID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/user/${userID}`)
            const data = await response.json();
      
            if (response.ok && data.success) {
                return {
                    success: true,
                    data: this.transformBookingsData(data.bookings),
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to fetch bookings"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            }
        }
    }

    static async fetchPendingBookingsByCampaignAPI(campaignID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/campaign/${campaignID}/pending`);
            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.bookings,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to fetch pending bookings"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async fetchConfirmedBookingsByCampaignAPI(campaignID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/campaign/${campaignID}/confirmed`);
            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.bookings,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to fetch confirmed bookings"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async approveBookingAPI(bookingID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/${bookingID}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.booking,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to approve booking"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async rejectBookingAPI(bookingID: string) {
        try {
            const response = await fetch(`${this.BOOKING_API_ENDPOINT}/${bookingID}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    data: data.booking,
                    error: null
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: data.error || "Failed to reject booking"
                };
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    
}