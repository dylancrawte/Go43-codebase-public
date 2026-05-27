**_LoginModal_**
The purpose of this modal is to provide a log in page. It also contains a 'sign up' button

This view is triggered once the EventCard component is clicked.

- isBottomModalExploreVisible useState hook is initially set to false -- ie the modal is not visible
- function openExploreModal will set the useState hook to true
- EventCard onPress triggers the openExploreModal function, and the useState hook is now set to true, ie the modal is visible.
- The final bit of this logic comes from <BottomModalExplore isVisible={isBottomModalExploreVisible}>. The true or false value set up from the button clicking is then inputted here.

There is some logic implemented into the 'dont have an account? sign up' button that ensures it is bot making the modal invisible, and loading the signUp.tsx page.

- In order for this logic to be implemented, a 'setIsVisible' prop was added to BottomModal This allows the modal to close itself by calling setIsVisible(false), which directly updates the isLoginModalVisible state in index.tsx — the component that controls the modal's visibility. Previously we had isVisible, but no way of changing the boolean value.
- The 'handlePressLogin' function was added to BottomModal.tsx file handle the closing of modal, and rendering of signUp.tsx page.
