import Process from './process';
import Syscall from './syscall';

function tokenize(cmd) {
    return [];
}

class Kernel {
    constructor(system) {
        this.system = system;
        this.syscalls = new Syscall(this);
        this.processStack = [];

        const shell = new Process(this, ['/bin/luscsh.lsc']);
        this._pushProcess(shell);
    }

    init() {
        this._setupInput();
    }

    run() {
        this.currentProcess().start();
    }

    currentProcess() {
        return this.processStack[this.processStack.length - 1];
    }

    initProcess(cmd) {
        const argv = tokenize(cmd);
        const parent = this.currentProcess();
        return new Process(this, argv, parent);
    }

    exitCurrentProcess() {
        this._popProcess().exit();
    }

    _switchProcess(p) {
        this._pushProcess(p);
        p.start();
    }

    _pushProcess(p) {
        this.processStack.push(p);
    }

    _popProcess() {
        const p = this.processStack.pop();
        return p;
    }

    _setupInput() {
        const input = this.system.input;
    }

    _onKey() {

    }
}

export default Kernel;
