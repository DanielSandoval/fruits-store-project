function responseCallback(response) {
    if (response.redirected) {
        alert('Cart is empty.');
    }
    else if(response.status === 200) {
        alert('Purchase made!');
    }
};

formHandler('purchase-form-button', '/api/cart-history/submit-payment', '/', responseCallback);