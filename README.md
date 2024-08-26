# XMPP Messaging Project

This is a real-time messaging application project that uses the XMPP (Extensible Messaging and Presence Protocol) protocol. The application allows communication between users through individual chats and chat rooms (groups). It is developed in React and uses the Strophe.js and Xmpp.js libraries to manage the XMPP connection and communication.

## Table of contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)

## Features

### Account Management
- **New account registration:** Allows users to register on the server.
- **Login:** Allows users to log in to their account.
- **Logout:** Allows users to logout.
- **Account Deletion:** Allows users to delete their account from the server.

### Communication
- **Real Time Messaging:** Send and receive messages instantly.
- **Individual Chats:** Private communication between two users.
- **Chat Rooms (Groups):** Participate in group discussions.
- **Attach Files:** Send attachments to messages.
- **Show Users and Status:** Displays a list of contacts and their current status.
- **Add Contacts:** Allows new users to be added to the contact list.
- **Unseen Message Notifications:**: Indicates the number of unread messages.
- **Notification of viewed messages:** In individual chats notifies users which messages have already been viewed.
- **Change status:** Allows users to change their own status and show it to their contacts.

Translated with DeepL.com (free version)

## Technologies

- **React**: Library to build the user interface.
- **XMPP**: Real-time messaging protocol.
- **Strophe.js and xmpp.js**: Libraries for handling the xmpp protocol.


## Installation
To run the vite server it is required to have an updated version of Node.js and for the installation of dependencies, the NPM package manager.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aq202/uvg_proyect1_networking.git

2. **Install dependencies**
   ```bash
   npm install

3. **Running the vite server**

   ```
   npm run dev
   ```

3. **Open browser and run localhost on port 5173**

    ```
    http://localhost:5173/
    ```