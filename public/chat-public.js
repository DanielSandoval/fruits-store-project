let socket = io();
let myUser = {}; // user holds the user/client information.
let messages = {}; // It holds all user connected ids with an array of each user messages.
let currentChatUser; // It holds the user we are currently chatting with. value assigned at the moment of click on user.
let receiver; /* It is to difference the user receiving the message 
    from the one who is sending the message.*/
let receiverUsername; // It is to hold the username of the receiver.

let usersListArea = document.getElementById('users-list-area'); //usersListArea is the element with the users connected.
let usersList = usersListArea.getElementsByTagName('ul')[0]; // usersList is each user element in list of users connected.
let messagesArea = document.getElementById('messages-area').querySelector('#messages'); // The element with the messages.
let messageParagraph; // This will be a paragraph and it will be appended to element with the messages.

// Event when my user conncets, print my socket id
socket.on('connect', function() {
    console.log('MY SOCKET ID AND USERNAME:');
    console.log(socket.id);
    myUser.socketId = socket.id;
});

// Event when a user connects to chat
socket.on('user', function(data) {
    /*
    * newUser each element(li) that will be appended to the list.
    * highlightedUser is the element(user) selected to chat with.
    * userText is the text name that will be appended to newUser(li).
    */
    let newUser, highlightedUser, userText;
    let userCount; // This is the element holding the number of users connected.
    let userChatInServer; // It will hold each user connected information.

    usersList.innerHTML = '';
    userCount = document.getElementById('users-count-number');
    userCount.textContent = 'Users connected: ' + data.currentUsers;

    /* Iterates over the users connected, creates an element with the names and 
        append it to list of users connected, then creates an event listener for each element to get the 
        corresponding chat.*/
    for(let i = 0; i < data.users.length; i++) {
        userChatInServer = data.users[i]; // We get each user connected from the server.
        // If current user has the same socketId as myUser, it means they are the same.
        if(myUser.socketId == userChatInServer.socketId) {
            myUser.userInfo = userChatInServer.userInfo;
            console.log(myUser.userInfo.username);
        }
        // Create an li element, add it text(each user connected), append it to list(usersList) on users connected area
        newUser = document.createElement('li');
        userText = document.createTextNode(userChatInServer.userInfo.name);
        newUser.classList.add('users-connected');
        newUser.setAttribute('id', userChatInServer.userInfo.username);
        newUser.appendChild(userText);
        usersList.appendChild(newUser);
        /*if(myUser.socketId == userChatInServer.socketId)
            myUser.userInfo = userChatInServer.userInfo;*/
        if(!messages.hasOwnProperty([userChatInServer.userInfo.username])) {
            messages[userChatInServer.userInfo.username] = {
                socketId: userChatInServer.socketId,
                userInfo: userChatInServer.userInfo,
                messagesInChat: []
            }; // fill each user connected id in the messages object with its name and an empty array for the messages.
        }
        else {
            messages[userChatInServer.userInfo.username].socketId = userChatInServer.socketId;
        }

        // add click event to every user in chat list
        (function(id, newUser) {
            newUser.addEventListener('click', function(e) {
                let paragraphIsTyping;
                e.preventDefault(); // This is necesary to avoid page loading again.
                if(myUser.socketId != messages[id].socketId) {
                    // If user has been selected on chat users list return it to original style.
                    if(highlightedUser) {
                        highlightedUser.style.color = 'black';
                        highlightedUser.style.fontWeight = 'normal';
                    }
                    // Next properties are to change style to element user when selected
                    newUser.style.color = 'green';
                    newUser.style.fontWeight = 'bold';
                    highlightedUser = newUser;
                    document.getElementById('current-chat').innerHTML = 'Chatting with: <b><u>' + messages[id].userInfo.name + ' ' + messages[id].userInfo.lastname + '</u></b>';
                    messagesArea.innerHTML = '';
                    currentChatUser = messages[id];
                    messages[currentChatUser.userInfo.username].messagesInChat.forEach(function(eachMessageInChat) {
                        fillMessagesAreaElementWithMessages(eachMessageInChat.sender, eachMessageInChat.message);
                    });
                    if(currentChatUser.isTyping) {
                        paragraphIsTyping = document.createElement('p');
                        paragraphIsTyping.setAttribute('id', 'message-user-typing');
                        paragraphIsTyping.appendChild(document.createTextNode(currentChatUser.isTyping));
                        messagesArea.appendChild(paragraphIsTyping);
                    }
                }
                else {
                    alert('You can\'t talk to yourself');
                }
            });
        })(newUser.id, newUser);
    } // End for
});

// user typing emitter
let text = document.getElementById('message-text-box');
let textMessage = document.getElementById('message-text-box');

text.addEventListener('input', function() {
    if(currentChatUser) {
        socket.emit('typing', {
            message: document.getElementById('message-text-box').value,
            currentChatUser
        });
    }
});

// user typing listener
socket.on('typing', function(data) {
    let text = document.createElement('p');
    let textNode = document.createTextNode(data.info);
    text.setAttribute('id', 'message-user-typing');
    text.appendChild(textNode);
    let textElement = messagesArea.querySelector('#message-user-typing');

    receiver = data.userSocket;
    receiverUsername = data.userSocket.userInfo.username;
    messages[receiverUsername].isTyping = data.info;
    if(data.message.length == 0) {
        messages[receiverUsername].isTyping = '';
    }

    if(currentChatUser && currentChatUser.userInfo.username == data.userSocket.userInfo.username) {
        if(!textElement) {
            messagesArea.appendChild(text);
        }
        else if(data.message.length == 0) {
            textElement.remove();
        }
    }
});

// send message emitter
let submitTextButton = document.getElementById('submit-text-button');

submitTextButton.addEventListener('click', function(e) {
    const eventInput = new Event('input');
    e.preventDefault();

    let textMessage = document.getElementById('message-text-box');
    let message = textMessage.value;
    if(!currentChatUser) {
        alert('Click on user to select chat');
    }
    else if(message) {
        textMessage.value = '';
        textMessage.dispatchEvent(eventInput);
        socket.emit('send-message', {currentChatUser, message});
    }
    else {
        alert('You have to write your message in the text box.');
    }
});

// message listener
socket.on('message', function(data) {
    let sender = data.userSocket;
    let senderName = sender.userInfo.name + ' ' + sender.userInfo.lastname;
    receiver = data.currentChatUser;
    if(myUser.socketId == receiver.socketId) {
        receiver = data.userSocket;
    }
    if(messages.hasOwnProperty(receiver.userInfo.username)) {
        messages[receiver.userInfo.username].messagesInChat.push({sender: senderName, message: data.message});
    }
    if(currentChatUser && currentChatUser.userInfo.username == receiver.userInfo.username) {
        fillMessagesAreaElementWithMessages(senderName, data.message);
    }
});

// fill with corresponding messages to the chat area
function fillMessagesAreaElementWithMessages(sender, message) {
    let messageParagraph = document.createElement('p');
    let textBoldName = document.createElement('b');
    let textNodeName = document.createTextNode(sender + ': ');
    let textNodeMessage = document.createTextNode(message);
    textBoldName.appendChild(textNodeName);
    messageParagraph.appendChild(textBoldName);
    messageParagraph.appendChild(textNodeMessage);
    messagesArea.appendChild(messageParagraph);
}