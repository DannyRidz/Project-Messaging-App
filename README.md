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
