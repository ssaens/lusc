class Inode {
    static create(disk, isDir) {
        const sector = disk.allocateExtent();
        const extent = disk.getExtent(sector);
        extent.isDir = isDir;
        return sector;
    }

    static open(disk, sector) {
        if (sector in Inode.openInodes) {
            const inode = Inode.openInodes[sector];
            ++inode.openCount;
            return inode;
        }
        const extent = disk.getExtent(sector);
        const inode = new Inode(sector, extent);
        Inode.openInodes[sector] = inode;
        return inode;
    }

    constructor(sector, extent) {
        this.sector = sector;
        this.extent = extent;
        this._isDir = this.extent.isDir;
        this.removed = false;
        this.openCount = 1;
    }

    reOpen() {
        ++this.openCount;
        return this;
    }

    close(disk) {
        if (--this.openCount === 0) {
            Inode.openInodes[this.sector] = null;
            delete Inode.openInodes[this.sector];
            if (this.removed) {
                this.extent = null;
                disk.freeExtent(this.sector);
            }
        }
    }

    remove() {
        this.removed = true;
    }

    isDir() {
        return this._isDir;
    }
}

Inode.openInodes = {};

class File {
    static create(disk) {
        const sector = Inode.create(disk, false);
        const extent = disk.getExtent(sector);
        extent.data = '';
        return sector;
    }

    constructor(inode) {
        this.inode = inode;
    }

    read() {
        return this.inode.extent.data;
    }

    write(data, append=false) {
        if (append) {
            this.inode.extent.data += data;
        } else {
            this.inode.extent.data = data;
        }
    }

    close() {
        this.inode.close();
    }
}

class DirEntry {
    constructor(sector, name, permissions) {
        this.sector = sector;
        this.name = name;
        this.permissions = permissions;
    }
}

const ROOT_SECTOR = 0;

class Directory {
    static create(disk) {
        const sector = Inode.create(disk, true);
        const extent = disk.getExtent(sector);
        extent.data = {};
        return sector;
    }

    static openRoot(disk) {
        const root = Inode.open(disk, ROOT_SECTOR);
        return new Directory(root);
    }

    constructor(inode) {
        this.inode = inode;
    }

    lookup(name) {
        return this.inode.extent.data[name];
    }

    add(name, sector) {
        this.inode.extent.data[name] = new DirEntry(sector, name, 0);
    }

    remove(name) {
        this.inode.extent.data[name] = null;
        delete this.inode.extent.data[name];
    }

    read() {
        return Object.keys(this.inode.extent.data)
            .filter(name => (name !== '.' && name !== '..'));
    }

    isEmpty() {
        return this.read().length === 0;
    }

    reOpen() {
        return new Directory(this.inode.reOpen());
    }

    close() {
        this.inode.close();
    }
}

export {
    Inode,
    File,
    Directory,
    ROOT_SECTOR
};
