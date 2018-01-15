import build from './lcc';

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
        const entry = this._load(src);
        if (!entry) {
            this.kernel.exitCurrentProcess();
        }
        entry(this.argv);
    }

    exit() {
        this.executable.close();
    }

    _load(file) {
        let fs = this.kernel.system.filesys;
        this.executable = fs.open(file);
        if (!this.executable) {
            return null;
        }

        let src = build(fs, this.executable);
        if (src === null) {
            console.log(`Failed to build ${file}`);
            return null;
        }

        return (function(fs) {
            const $_meta = {};
            Object.defineProperties($_meta, {
                name:   { value: file },
                src:    { value: src }
            });
            Object.seal($_meta);
            file = undefined;
            src = undefined;

            return eval(`var main; ${$_meta.src}; main;`);
        })();
    }
}

export default Process;
