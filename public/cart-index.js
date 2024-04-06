let fruitsArr = ['apple', 'banana', 'orange', 'pineapple', 'watermelon', 'strawberry', 'melon', 'pear', 'grape', 'mango'];
let url = '/api/cart/add-fruit-to-cart/';

function responseCallback(response) {
    if(response.ok) {
        alert('Item added to cart successfully.');
    }
};

for (const fruit of fruitsArr) {
    formHandler(fruit, url + fruit, '/', responseCallback);
}