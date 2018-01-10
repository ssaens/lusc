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
        return file.write();
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

    }

    exit(status) {

    }
}

export default Syscall;
