**_Global state management store for authentication_**
This file uses Zustand to hold authentication related state, for signing up.

Initialises user (identifier), jwt token (authenticated requests) and isLoading (boolean to track registration request status)

Register function:
1- receives variables from the user's input (from SignUp.tsx). Sends a POST request to the backend (api/auth/register).
2- Saves returned user and token in AsyncStorage
3- updates state
4 returns success / error response for UI handling

**_SESSION HANDLING_**
checkAuth:

- reads persisted data (token + user) from AysncStorage,
- parses and restores data into zustands in-memory state using set()

This now means the app can reload and token & user from registration can still be accessed.
