**_EVENT CARD_**
EventCard is the dummy event visualisation. It is imported from the components folder and rendered via a View.
When it is clicked, 'openExploreModal' is triggered.

- openExploreModal is a function that changes 'setIsBottomModalExploreVisible' to true. Below is the logic behind rendering of bottomModal, but essentially clicking on the card configures a boolean variable assigned to the isVisible function of BottomModal, to true.

**_BottomModal_**
The purpose of this modal is to provide further detail of the event. It also contains a 'confirm booking' button, which will save the event into bookings once clicked.

This view is triggered once the EventCard component is clicked.

- isBottomModalExploreVisible useState hook is initially set to false -- ie the modal is not visible
- function openExploreModal will set the useState hook to true
- EventCard onPress triggers the openExploreModal function, and the useState hook is now set to true, ie the modal is visible.
- The final bit of this logic comes from <BottomModalExplore isVisible={isBottomModalExploreVisible}>. The true of false value set up from the button clicking is then inputted here.
