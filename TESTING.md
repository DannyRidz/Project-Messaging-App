# Messaging App test record

Date: 2026-09-30
Browser: Chromium (Playwright); desktop and 375px mobile viewport
Accounts used: Four disposable accounts (Alice, Bob, third member, outsider)

Mark a box only after you observe the expected result.

- [x] J1 Registration and login: Register a new account, log in, refresh, then log out. Registration rejects a duplicate email or username. Refresh keeps a valid login. Logout returns to Log in.
- [x] J2 Profile: Change your display name and bio, refresh, and confirm both persist. Clear the bio and confirm it stays empty.
- [x] J3 Direct conversation: Search for Bob, open a direct conversation, return to Conversations, and open Bob again. The same conversation opens rather than creating another one.
- [x] J4 Text messages: Send messages from Alice and Bob in separate windows. Each window receives the other's message without a manual refresh. Refresh both windows and confirm the messages remain.
- [x] J5 Message history: In a conversation with enough messages, use Load older messages. Older messages appear without duplicating newer messages.
- [x] J6 Images: Send a valid image with a caption and another without a caption. Both display after refresh. An invalid file produces an error without losing the message draft.
- [x] J7 Friends: Alice adds Bob. Bob's own friends list does not automatically add Alice. Alice removes Bob; their existing conversation and messages remain.
- [x] J8 Online status: With Bob's app visible, Alice sees Bob Online. Close or log out of every Bob session. After about 90–100 seconds Alice sees Bob Offline. Logging Bob in again updates the status.
- [x] J9 Group chat: Alice creates a group with Bob and a third account. All three see the group, its member names, text messages, and images. A reply from one member reaches the others.
- [x] J10 Group privacy: An account outside the group cannot see it in Conversations. Opening the group's URL directly shows an access error, not its messages.
- [x] J11 Logged-out access: After logout, directly open /profile, /friends, and a conversation URL. Each takes you to Log in.
- [x] J12 Small screen and keyboard: At a narrow mobile width, the main screens fit without sideways scrolling. Use Tab to reach navigation, forms, and chat buttons; the focused control is visible.
- [x] J13 Error recovery: Temporarily disconnect the backend or use the browser's Offline setting while viewing a list or sending a message. An error appears. Reconnect and retry; your unsent message remains available.

## Failures or observations

No application failures observed. J5 used 55 disposable messages to exercise pagination. J8 was observed after Bob logged out and his activity expired. J13 used the browser's Offline setting, then a successful retry. The four disposable accounts and all their related data were removed; the original database fingerprint was unchanged.
