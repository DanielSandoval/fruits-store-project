# fruits-store-project

### Link to Living Page:
[Link](https://fruits-store-project.onrender.com)

### Description
1. I developed an online store for fruits and vegetables using Node.js and MongoDB. Users can browse and purchase fresh products, and the data is securely stored in a MongoDB database. I implemented user authentication and authorization to enhance the user experience. I performed unit tests and endpoint testing to ensure robust functionality and reliability.
2. I created a real-time chat application using WebSockets and Node.js. Users can join chat rooms, send messages, and view real-time updates. This application showcases my skills in real-time web development.

### Testing Instructions:

##### User Authentication:
- All endpoints require user authentication.
- Users log in with their email and password.
- The system identifies the user type (`admin` or `user`) and presents content accordingly.

#### User Types:
- There are two user types: `admin` and `user`, each with distinct functionalities.
- Default test users are available:
  - `admin1@admin` with the password `admin123` (`admin` type).
  - `user1@user` with the password `user123` (`user` type).
  - `w@w` with the password `123` (`user` type).

#### User Actions:
  - User Type `user`:    
        `User`-type users can interact with the following features:
        - Add products to the shopping cart.
        - Clear the shopping cart.
        - Complete purchases.
