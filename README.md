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

## Database design

### users

Stores registered accounts.

- id: primary key
- username: required and unique
- email: required and unique
- password_hash: required
- display_name: required
- bio: optional
- last_active_at: optional timestamp
- created_at: required timestamp

### conversations

Stores direct and group conversations.

- id: primary key
- type: either direct or group
- name: required for groups; absent for direct conversations
- created_by: foreign key referencing users.id
- created_at: required timestamp

### conversation_members

Connects users to conversations.

- conversation_id: foreign key referencing conversations.id
- user_id: foreign key referencing users.id
- joined_at: required timestamp
- Primary key: the combination of conversation_id and user_id

### messages

Stores messages within conversations.

- id: primary key
- conversation_id: foreign key referencing conversations.id
- sender_id: foreign key referencing users.id
- body: optional text
- created_at: required timestamp

A message must contain text, at least one image, or both.

### message_attachments

Stores metadata about images attached to messages.

- id: primary key
- message_id: foreign key referencing messages.id
- storage_key: required identifier for the stored image
- mime_type: required image content type
- byte_size: required positive file size
- created_at: required timestamp

Image files live in file storage.
The database stores information needed to locate and display them.

### friendships

Stores each user's personal friends list.

- user_id: foreign key referencing users.id
- friend_id: foreign key referencing users.id
- created_at: required timestamp
- Primary key: the combination of user_id and friend_id

A user cannot add themselves as a friend.
Adding a friend does not automatically add the reverse relationship.

## Database and application rules

- Normalize usernames and emails before storing and comparing them.
- Store password hashes, never plaintext passwords.
- A direct conversation has exactly two members.
- Reuse an existing direct conversation between the same two users.
- A group starts with its creator and at least one other user.
- Only conversation members can read or send its messages.
- Determine the message sender from the authenticated session.
- Reject messages that contain neither text nor an image.
- Create a message and its attachment records together in a transaction.
- Friendship does not control conversation membership.
