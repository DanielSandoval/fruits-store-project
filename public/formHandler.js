let reqMethodFuncs = {
    post: async function(requestUrl, objRequestString) {
        return await fetch(requestUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: objRequestString
        });
    }
};

async function sendData(form, requestUrl, redirectUrl, responseCallback) {
    let formData = new FormData(form);
    let objRequest = {};
    let objRequestString;
    let method = form.getAttribute('method');

    for (const pair of formData.entries()) {
        objRequest[pair[0]] = pair[1];
    }
    objRequestString = JSON.stringify(objRequest);
    console.log(form.getAttribute('method'));

    try {
        let response = await reqMethodFuncs[method](requestUrl, objRequestString);
        responseCallback(response);
        window.location = redirectUrl;
    } catch (error) {
        console.log(error);
        alert('There was an error');
    }
};

function formHandler(formId, requestUrl, redirectUrl, responseCallback) {
    let form = document.getElementById(formId);

    // We are using IIFE so form is different in each event call.
    (function (form, responseCallback) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            await sendData(form, requestUrl, redirectUrl, responseCallback);
        })
    })(form, responseCallback);
};