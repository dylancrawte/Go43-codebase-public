Clicking on Confirm booking button will call handleConfirmedBooking function

ConfirmedBookings initially is empty. handleConfirmedBooking function calls the setConfirmedBookings hook (useContext hook) to update confirmedBookings with eventID = true. Here, this means that 'AndyC' is now true, ie the confirmed booking button sets the event value to true.

In bookings.tsx, we import the same confirmedBookings from BottomModal.tsx - which holds the current bookings.
**_{confirmedBookings["AndyC"] && (_**
this line checks confirmedBookings with AndyC key value exists, and if so, displays the EventCard.

When multiple bookings come through, AndyC hardcoding needs to be replaced with a for each loop that renders each booking eventId.
