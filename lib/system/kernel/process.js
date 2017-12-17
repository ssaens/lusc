import 'lib/system/device/filesys';

const NOOP = function () {};

class Process {
    constructor() {
        this.entry = NOOP;
    }

    load() {

    }

    run() {
        return this.entry;
    }
}

export default Process;