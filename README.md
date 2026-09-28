# Messaging App

A web app where users can exchange messages and customize their profiles.

## Core features

- Create an account.
- Log in and log out.
- Find another user and start a direct conversation.
- Send and view text messages.
- Edit your own display name and bio.
- Keep conversations accessible only to their members.

## Extra credit

- Send images in conversations.
- Add and remove friends.
- See whether friends are recently active.
- Create group chats and send messages to the group.

## Main screens

- Sign up
- Log in
- Conversations
- Chat
- Profile
- Friends
- Create group

## Access rules

- Users must log in to use the messaging features.
- Users can edit only their own profiles.
- Users can read and send messages only in conversations they belong to.
- The server determines who sent each message from the login session.

## Technology

- Frontend: React with Vite
- Backend: Node.js with Express
- Database: PostgreSQL
- Database access: pg

## Update behavior

The app periodically requests new messages and friend activity.
Online status means recently active, rather than guaranteed connected.

## Screen navigation

### Before login

- Visitors start on the login screen.
- The login screen links to sign up.
- Successful registration takes the user to login.
- Successful login takes the user to conversations.

### After login

- Conversations is the main screen.
- Selecting a conversation opens its messages.
- New chat opens a user-search dialog.
- Selecting a user opens or creates a direct conversation.
- Friends opens the friends screen.
- Profile opens the profile editor.
- Create group opens the group creation screen.
- Creating a group opens the new group conversation.
- Logging out returns the user to login.

### Mobile layout

- Show the conversation list and chat separately.
- Selecting a conversation opens the chat.
- A back button returns to the conversation list.

## Feedback states

- Show a loading message while fetching data.
- Show a helpful empty state when a list has no items.
- Show an error message when an operation fails.
- Keep typed messages available if sending fails.
- Disable repeated submission while a request is pending.

## Friendship behavior

Adding a friend adds that user to your personal friends list.
Removing a friend removes them from your list.
Friendship does not grant access to private conversations.
Z
