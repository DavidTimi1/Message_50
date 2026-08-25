
# README for Message_50 Web App

## Table of Contents
1. [Introduction](#introduction)
2. [Motivation](#motivation)
3. [Features](#features)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Folder Structure](#folder-structure)
7. [API Documentation](#api-documentation)
8. [Backend Repository](#backend-repository)
9. [Contributing](#contributing)
10. [FAQs](#faqs)
11. [License](#license)
12. [Contact Us](#contact-us)
13. [Additional Resources](#additional-resources)

---

## Introduction
Message_50 is a modern, secure, and fast messaging web application designed to provide seamless communication for users. It leverages cutting-edge technologies such as the Subtle Crypto API, WebSockets, and IndexedDB to ensure a highly secure and efficient messaging experience. This repository contains the frontend code for the application.

[Visit site](https://message50-frontend.vercel.app)

---

## Motivation
The motivation behind creating Message_50 stems from the need for a reliable, private, and user-friendly messaging platform. With increasing concerns about data privacy and security, Message_50 aims to provide:
- **End-to-End Encryption**: Ensuring that user data remains private and secure.
- **Cross-Platform Accessibility**: Allowing users to stay connected across devices.
- **Real-Time Communication**: Leveraging WebSockets for instant message delivery.
- **Ease of Use**: A clean, intuitive interface for users of all technical backgrounds.

Message_50 is built with the vision of fostering private and meaningful connections between friends, families, and colleagues.

---

## Features
- **End-to-End Encryption**: Messages are encrypted and can only be read by the sender and recipient.
- **Cross-Platform Support**: Access your chats on mobile, tablet, and desktop devices.
- **Real-Time Messaging**: Instant message delivery using WebSockets.
- **Media Sharing**: Share images, videos, and documents securely.
- **User-Friendly Interface and Experience**: A clean and intuitive design for effortless navigation.

---

## Installation
To set up the frontend of Message_50 locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/davidtimi1/Message_50.git
    ```

2. Navigate to the project directory:
    ```bash
    cd Message_50
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

---

## Usage
1. Open your browser and navigate to `http://localhost:3000`.
2. [Set up the backend](https://github.com/davidtimi1/MSG50-BE) 
3. Sign up or log in to access the messaging features (optional guest mode).
4. Explore functionalities such as sending messages and sharing media files.

---

## Folder Structure
```
Message_50/ # Root Directory
├── dist/  # build files
├── src/
│   ├── app/ # structured like Nextjs app router
│   │   ├── chats/
│   │   ├── contacts/
│   │   ├── media/
│   │   ├── settings/
│   │   └── feedback/
│   ├── auth/ # auth lib and resources
│   ├── landing/ # landing page resources
        ...
│   │   └── page.jsx
│   ├── lib/ # addn lib and modules
│   ├── users/ 
│   │   └── page.jsx # dynamic route for handling unauthed user view
│   ├── ui/ # global css files
│   ├── App.jsx
│   ├── index.jsx
│   └── service-worker.js
├── public/  #
│   ├── index.html
    ├── logo.png
    ├── logo.svg
    ├── user-icon.svg
    ├── mainfest.json
│   └── favicon.ico
├── prerendered-htmls/ # html snapshot of important routes (support SEO and prefetch)
│   └── ...
├── vite.config.mjs # bundling config
├── vercel.json
├── package.json
└── README.md # docs
```


---

## Frontend Architecture & E2EE Sync (v2 Upgrade)

### React Query Hooks (`src/api/index.js`)
All side-effects, settings mutations, profile updates, and E2EE key/message queries are managed using `@tanstack/react-query` to provide clean caching, transition skeletons, and error boundary behaviors.
- `useMessages(chatting, viewMsg)`: Hydrates messages from local IndexedDB, providing reactive updates when real-time socket events mutate the query cache.
- `useChats()`: Hydrates the active chat threads from IndexedDB.
- `useUserSettings()` / `useUpdateUserSettings()`: Queries and modifies user preferences from `/api/v2/user/settings`.
- `useUpdateProfile()`: Handles avatar image and bio uploads targeting `/api/v2/user/profile-edit`.
- `useSubmitFeedback()`: Submits user feedback reports.

### WebSocket Framework & Real-Time Sync
WebSocket connections (`ws/chat/`) are initiated via `<SocketProvider>` in `SocketContext.jsx`. The connection:
1. Hydrates offline messages automatically upon connection by sending `{"action": "ready"}`.
2. Maintains a keepalive ping every 25 seconds.
3. Automatically halts reconnection loops and redirects to `/login` if auth verification fails (`e.code === 400`).

#### Message Flows & Status ACK Protocols
- **Typing States**: Typing triggers emit `{"action": "typing", "receiverID": "...", "isTyping": true}`. Inbound typing events update `["typing", senderID]` cache variables to trigger instant header and bubble indicator renders.
- **Delivery ACK**: When online, incoming `new-message` events are decrypted, persisted to IndexedDB, and immediately acknowledged by emitting `{"action": "status-ack", "status": "d"}` back to the sender.
- **Read ACK**: When Bob views Alice's conversation thread, the frontend filters all unread incoming messages and emits `{"action": "status-ack", "status": "r"}` for each message. The local IndexedDB is simultaneously updated to prevent duplicate emissions.
- **Optimistic Caching**: Sending messages appends a transient item to both the message outbox (`["messages"]`) and the thread outbox (`["chats"]`). The UI reflects the pending state (clock icon) immediately.

---

## Backend Repository
The backend code for Message_50 is hosted in a separate repository [`MSG50-BE`](https://github.com/davidtimi1/MSG50-BE). It handles server-side operations, including user authentication, message storage, and real-time communication using WebSockets.

### Repository Link
You can find the backend repository here: [MSG50-BE GitHub Repository](https://github.com/davidtimi1/MSG50-BE)


### Contribution Guidelines
- Ensure your code follows the project's coding standards.
- Write clear commit messages.
- Test your changes thoroughly before submitting a pull request.
- Provide detailed descriptions of your changes in the pull request.

---

## FAQs
### Is my data secure on this platform?
Yes, we use end-to-end encryption (E2EE) to ensure your data remains private and secure.

### Can I use this platform on multiple devices?
Absolutely! Our platform is cross-platform and works seamlessly on all your devices.

### How fast is the message delivery?
Messages are delivered instantly using WebSockets and cutting-edge technology.

### What is end-to-end encryption (E2EE)?
E2EE ensures that only you and the person you're communicating with can read the messages. No one else, not even the platform, can access your messages.

### Are media files also encrypted?
Yes,
at happens if I lose my device?
If you lose your device, your messages cannot be accessed without your private key. Always ensure you have a backup of your encryption keys.

---

## License
T [Read more]()hi
#roject is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact Us
For any inquiries or feedback, please visit our [Contact Us](#contact-us) page or send us a message through the feedback form.

---

## Additional Resources
- **Privacy Policy**: [Privacy Policy](./privacy.pdf)
- **Terms of Use**: [Terms of Use](./terms.pdf)
- **Developer Portfolio**: [David Uwagbale's Portfolio](https://davidtimi.tech)
- **Mail**: [Message50 Devs](mailto:devs.message50@gmail.com)
