const NOOP = function () {};

function parse_cmd(cmd) {

}

class Process {
    constructor(k, argv, parent=null) {
        this.kernel = k;
        this.argv = argv;
        this.parent = parent;
        if (parent) {
            this.cwd = parent.cwd.reOpen();
        }

        this.executable = null;
        this.entry = null;
    }

    getCwd() {
        return this.cwd;
    }

    setCwd(dir) {
        this.cwd = dir;
    }

    execute(cmd) {
        const argv = parse_cmd(cmd);
        return new Process(this.kernel, argv, this);
    }

    start() {
        const src = this.argv[0];
        if (!this._load(src)) {
            this.kernel.exitCurrentProcess();
        }
        this.entry();
    }

    exit() {
        this.executable.close();
    }

    _load(file) {
        const fs = this.kernel.system.filesys;
        this.executable = fs.open(file);

        const src = this.executable.read();
        console.log(src);

        function entry() {
            eval('console.log(this);');
        }

        this.entry = entry;
        return true;
        /*

        const src = this.executable.read();
        const __includes__ = [];

        // Populate scope with keywords and syscalls
        const include = (file) => __includes__.push(file);
        const {
            open,
            write,
            create,
            mkdir,
            remove
        } = this.kernel.syscalls;

        let main = null;
        eval(src);
        if (!main) {
            print(`method Main not found in ${file}`);
            return;
        }
        const __main__ = main;
        for (const includeName of __includes__) {
            const i = fs.open(includeName);
            if (!i) {
                print(`Module ${includeName} does not exist`);
                return;
            }
            eval(i.read());
            i.close();
            if (main !== __main__) {
                print(`Duplicate definition of method main`);
                return;
            }
        }

        this.entry = __main__;
        */
    }
}

export default Process;
