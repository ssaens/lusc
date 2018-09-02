const EVENT = {
    KEYDOWN: 'keydown'
};

class Input {
    constructor() {
        this.callbacks = {};
    }

    attach() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    detach() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    register(listener) {

    }

    onKeyDown = (e) => {

    };

    onKeyUp = (e) => {

    };
}

export default Input;