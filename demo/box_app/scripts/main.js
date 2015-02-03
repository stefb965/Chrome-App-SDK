// Listens for the app launching then creates the window
chrome.app.runtime.onLaunched.addListener(function() {
    var width = 500;
    var height = 300;

    chrome.app.window.create('index.html', {
        id: 'box',
        bounds: {
            width: width,
            height: height
        }
    });
});
