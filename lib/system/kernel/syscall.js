class Syscall {
    constructor(k) {
        this.k = k;
    }

    open(file) {
        return this.k.filesys.resolve(file);
    }

    read(file) {
        return file.read();
    }

    write(file, data) {
        return file.write(data);
    }

    create(file) {

    }

    remove(file) {

    }

    mkdir(file) {

    }

    chdir(file) {

    }

    rmdir(dir) {

    }

    exec(cmd) {
        const process = new Process(this.k, cmd.split(' '));
        this.k.switchProcess(process);
    }

    exit(status) {

    }
}

function getBoundSyscalls(k) {
    return {
        open(file) {
            return k.filesys.resolve(file);
        },

        read(file) {
            return file.read();
        },

        write(file, data) {

        },

        create(file) {

        },

        remove(file) {

        },

        mkdir(file) {

        },

        chdir(file) {

        },

        rmdir(dir) {

        },

        exec(cmd) {
            const process = new Process(k, cmd.split(' '));
            k.switchProcess(process);
        },

        exit(status) {

        }
    };
}

export default Syscall;
