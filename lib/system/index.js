import Kernel from './kernel';
import { Filesystem, Disk, TTY, Formatter, dir, file, LUSCFS_FORMATTER } from './device';

const DEFAULT_CONFIG = {
    disk: new Disk(),
};

class System {
    constructor() {
        this.config = DEFAULT_CONFIG;
        this.kernel = new Kernel(this);
        this.tty = new TTY(this);
    }

    boot() {
        this._processConfig();
        this.kernel.init();
        this.filesys = new Filesystem(this);
        this.filesys.init();
        this.kernel.run();
    }

    setConfig(config) {
        this.config = Object.assign(this.config, config);
    }

    _processConfig() {
        this.disk = this.config.disk;
        this.input = this.config.input;
    }
}

export default System;
