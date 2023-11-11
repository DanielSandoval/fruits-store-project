# fruits-store-project

### Link to Living Page:
[Link to Functional Page](https://fruits-store-project.onrender.com)

### Description
1. I developed an online store for fruits and vegetables using Node.js and MongoDB. Users can browse and purchase fresh products, and the data is securely stored in a MongoDB database. I implemented user authentication and authorization to enhance the user experience. I performed unit tests and endpoint testing to ensure robust functionality and reliability.
2. I created a real-time chat application using WebSockets and Node.js. Users can join chat rooms, send messages, and view real-time updates. This application showcases my skills in real-time web development.

### Testing Instructions:

##### 1. User Authentication:
- All endpoints require user authentication.
- Users log in with their email and password.
- The system identifies the user type (`admin` or `user`) and presents content accordingly.

##### 2. User Types:
- There are two user types: `admin` and `user`, each with distinct functionalities.
- Default test users are available:
  - `admin1@admin` with the password `admin123` (`admin` type).
  - `user1@user` with the password `user123` (`user` type).
  - `w@w` with the password `123` (`user` type).

##### 3. Registration:
- Users can register accounts, and by default, they are registered as `user` type accounts.
- `admin`-type accounts can only be created by other admin-type accounts.

##### 4. User Actions:
- User Type `user`:
  - Add products to the shopping cart.
  - Clear the shopping cart.
  - Complete purchases.

- User Type `admin`:
  - A default product inventory is automatically established upon initiation. `admin` accounts have the capability to reset the inventory to its default state.
  - `admin` users, upon logging in, have the capability to create additional `admin` user accounts directly from the platform.
  - `admin`-type users have the authority to update and modify the product inventory.

##### 5. Real-Time Chat Support:
- A 'Real-Time Chat Support' section is available in the navigation menu, allowing users to engage in live chat for customer service inquiries.
- Users can access the chat room to communicate with connected users.
- Users can choose which user to chat with and engage in real-time conversations.
- Chat history is accessible to review past messages exchanged in the chat room.
- The list of connected users is dynamically updated as users join or leave the chat room.
