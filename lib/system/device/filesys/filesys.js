import { Inode, File, Directory, ROOT_SECTOR } from './file';
import { LUSCFS_FORMATTER } from './formatter';

class Filesystem {
    constructor(system) {
        this.system = system;
        this.disk = system.disk;
    }

    init() {
        this._format();
        const root = Directory.openRoot(this.system.disk);
        root.add('.', ROOT_SECTOR);
        root.add('..', ROOT_SECTOR);
        this.system.kernel.currentProcess().setCwd(root);
    }

    create(name) {
        const [dir, basename] = this._resolve(name);
        const sector = File.create(this.disk);
        dir.add(basename, sector);
    }

    open(name) {
        const [dir, basename] = this._resolve(name);
        const entry = dir.lookup(basename);
        dir.close();
        if (!entry) {
            return null;
        }

        const inode = Inode.open(this.disk, entry.sector);
        return inode.isDir() ? new Directory(inode) : new File(inode);
    }

    remove(name) {
        const [dir, basename] = this._resolve(name);
        const success = dir.remove(basename);
        dir.close();
        return success;
    }

    mkdir(name) {
        const [dir, basename] = this._resolve(name);
        const sector = Directory.create(this.disk);
        dir.add(basename, sector);

        const inode = Inode.open(this.disk, sector);
        const newDir = new Directory(inode);
        newDir.add('.', sector);
        newDir.add('..', dir.inode.sector);
        newDir.close();
    }

    chdir(name) {
        const [dir, basename] = this._resolve(name);
        const entry = dir.lookup(basename);
        if (!entry) {
            return false;
        }
        const process = this.system.kernel.currentProcess();
        process.getCwd().close();
        process.setCwd(entry.open());
        return true;
    }

    _resolve(name) {
        let currDir;
        if (name[0] === '/') {
            currDir = Directory.openRoot(this.disk);
        } else {
            const process = this.system.kernel.currentProcess();
            currDir = process.getCwd().reOpen();
        }

        const tokens = name.split('/').filter(Boolean);

        let nextDir;
        let basename = tokens.length ? tokens[0] : '.';
        for (let i = 0; i < tokens.length - 1; ++i) {
            nextDir = tokens[i];
            basename = tokens[i + 1];
            const entry = currDir.lookup(nextDir);
            currDir.close();

            if (!entry) {
                return [null, null];
            }

            const inode = Inode.open(this.disk, entry.sector);
            if (!inode.isDir()) {
                return [null, null];
            }
            currDir = new Directory(Inode.open(this.disk, entry.sector));
        }
        return [currDir, basename];
    }

    _checkPermissions(entry) {

    }

    _format() {
        LUSCFS_FORMATTER.format(this.disk);
    }
}

export default Filesystem;
