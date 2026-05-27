import { bookingsAPI } from "../api/bookingsAPI";

export class BookingsManagementService {

    // validation - backend
    static validateBookingRequest(userID: string, campaignID: string, status: string) {
            const errors: string[] = [];
            
            if (!userID) {
                errors.push("User not authenticated")
            } else if (!campaignID) {
                errors.push("Campaign not selected")
            } else if (!status) {
                errors.push("Status not selected")
            }

            return { isValid: errors.length === 0, errors };
    }

    static async createBooking(userID: string, campaignID: string, status: string) {
        
        const validation = this.validateBookingRequest(userID, campaignID, status);
        if (!validation.isValid) {
            return {
                success: false,
                data: null,
                error: validation.errors.join(", ")
            };
        }

        return await bookingsAPI.createBookingAPI(userID, campaignID, status);
    }
    
    static extractBookingID(bookingIds: {[key: string]: string}, campaignID: string) {
        return bookingIds[campaignID] || null;
    }

    static async cancelBooking(bookingID: string) {
        return await bookingsAPI.deleteBookingAPI(bookingID);
    }

    static async fetchUserBookings(userID: string) {
        if (!userID) {
            return {
                success: false,
                data: null,
                error: "User ID is required"
            };
        } 

        return await bookingsAPI.fetchBookingsByUserAPI(userID);
    }
  
    static async fetchPendingBookingsByCampaign(campaignID: string) {
        if (!campaignID) {
            return {
                success: false,
                data: null,
                error: "Campaign ID is required"
            };
        }

        return await bookingsAPI.fetchPendingBookingsByCampaignAPI(campaignID);
    }

    static async fetchConfirmedBookingsByCampaign(campaignID: string) {
        if (!campaignID) {
            return {
                success: false,
                data: null,
                error: "Campaign ID is required"
            };
        }

        return await bookingsAPI.fetchConfirmedBookingsByCampaignAPI(campaignID);
    }

    static async approveBooking(bookingID: string) {
        if (!bookingID) {
            return {
                success: false,
                data: null,
                error: "Booking ID is required"
            };
        }

        return await bookingsAPI.approveBookingAPI(bookingID);
    }

    static async rejectBooking(bookingID: string) {
        if (!bookingID) {
            return {
                success: false,
                data: null,
                error: "Booking ID is required"
            };
        }

        return await bookingsAPI.rejectBookingAPI(bookingID);
    }
}

