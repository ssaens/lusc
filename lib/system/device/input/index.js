const EVENT = {
    KEYDOWN: 'keydown'
};

class Input {
    constructor() {
        this.callbacks = {};
    }

    attach() {
        window.addEventListener('keydown', e => this.onKeyDown(e));
    }

    register(listener) {

    }

    onKeyDown(e) {

    }

    onKeyUp(e) {

    }
}

export default Input;