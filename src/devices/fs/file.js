const File = ({ FNode }) => class _File {

  static open(sector) {
    const fnode = FNode.open(sector);
    if (fnode.isDir) {
      fnode.close();
      return null;
    }
    return new _File(fnode);
  }

  static create(basename, parent) {
    return FNode.create({
      meta: { basename, parent },
      contents: ''
    });
  }

  constructor(fnode) {
    this.fnode = fnode;
  }

  read() {
    return this.data.contents;
  }

  write(data, append=false) {
    if (append) {
      this.data.contents += data;
    } else {
      this.data.contents = data;
    }
  }

  writeMeta(updates) {
    Object.assign(this.meta, updates);
  }

  close() {
    this.fnode.close();
  }

  get data() {
    return this.fnode.extent.data;
  }

  get meta() {
    return this.fnode.extent.meta;
  }

  get id() {
    return this.fnode.sector;
  }

  get basename() {
    return this.meta.basename;
  }
};

const Directory = ({ FNode }) => {
  class _Directory {

    static ROOT_SECTOR = 0;

    static open(sector) {
      const fnode = FNode.open(sector);
      if (!fnode.isDir) {
        fnode.close();
        return null;
      }
      return new _Directory(fnode);
    }

    static create(basename, parent) {
      const sector = FNode.create({
        meta: { basename },
        entries: { }
      }, true);
      const dir = _Directory.open(sector);
      dir.add('.', sector);
      dir.add('..', parent);
      dir.close();
      return sector;
    }

    static createEntry(sector, name, permissions) {
      return {sector, name, permissions};
    }

    constructor(fnode) {
      this.fnode = fnode;
    }

    writeMeta(updates) {
      Object.assign(this.meta, updates);
    }

    lookup(name) {
      return this.entries[name];
    }

    add(name, sector) {
      this.entries[name] = _Directory.createEntry(sector, name, 0);
    }

    remove(name) {
      const entry = this.entries[name];
      if (!entry) {
        return false;
      }
      FNode.free(entry.sector);
      this.entries[name] = null;
      delete this.entries[name];
      return true;
    }

    read() {
      return Object.keys(this.entries)
        .filter(name => (name !== '.' && name !== '..'));
    }

    close() {
      this.fnode.close();
    }

    reOpen() {
      return new _Directory(this.fnode.reOpen());
    }

    get isEmpty() {
      return this.read().length === 0;
    }

    get extent() {
      return this.fnode.extent;
    }

    get entries() {
      return this.fnode.extent.data.entries;
    }

    get meta() {
      return this.fnode.extent.data.meta;
    }

    get id() {
      return this.fnode.sector;
    }

    get basename() {
      return this.meta.basename;
    }
  }

  return _Directory;
};

export {
  File,
  Directory
};
