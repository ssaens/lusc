class TTY {
    constructor() {
        this.lineBuffer = [];
    }

    top() {
        return this.lineBuffer[this.lineBuffer.length - 1];
    }

    swap(s) {
        this.lineBuffer[this.lineBuffer.length - 1] = s;
    }

    putC(c) {
        this.swap(this.top() + c);
        console.log(this.top());
    }

    putS(s) {
        this.lineBuffer.push(s);
        console.log(this.top());
    }

    dump() {
        console.log(this.lineBuffer);
    }
}

export default TTY;
