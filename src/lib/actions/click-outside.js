function clickOutside(element, callback, excludeElement) {
    function onClick(event) {
        if (event.target == excludeElement) {
            return;
        }

        if (!element.contains(event.target)) {
            callback();
        }
    }

    document.body.addEventListener('click', onClick);

    return {
        update(newCallback) {
            callback = newCallback;
        },
        destroy() {
            document.body.removeEventListener('click', onClick);
        }
    }
};

export default clickOutside;