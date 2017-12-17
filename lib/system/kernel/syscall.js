function sys_open(k) {
    async function open(file) {
        return k.filesys.resolve(file);
    }
    return open;
}

function sys_read(k) {
    async function read(file) {
        return file.data;
    }
    return read;
}

function sys_write(k) {
    async function write(file) {

    }
    return write;
}

function sys_create(k) {
    async function create(file) {

    }
    return create;
}

function sys_remove(k) {
    async function remove(file) {

    }
    return remove;
}

function sys_mkdir(k) {
    async function mkdir(dir) {

    }
    return mkdir;
}

function sys_chdir(k) {
    async function chdir(dir) {

    }
    return chdir;
}

function sys_rmdir(k) {
    async function rmdir(dir) {

    }
    return rmdir;
}

function sys_exec(k) {
    async function exec() {

    }
    return exec;
}

function sys_all(k) {

}

export default {
    sys_open,
    sys_read,
    sys_write,
    sys_create,
    sys_remove,
    sys_mkdir,
    sys_chdir,
    sys_rmdir,
    sys_all
}