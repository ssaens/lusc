import boot from 'userlib/boot.lsc';
import luscsh from 'userlib/lscsh.lsc';
import test from 'userlib/test.lsc';
import path from 'path-browserify';

const FileSystem = ({ FNode, File, Directory }, { disk }) => kernel => {

  const formatterFile = (name, data) => parent => {
    const sector = File.create(name, parent.id);
    const file = File.open(sector);
    file.write(data);
    file.close();
    parent.add(name, sector);
  }

  const formatterDir = (name, contents=[]) => parent => {
    const sector = Directory.create(name, parent.id);
    const dir = Directory.open(sector);
    for (const formatter of contents) {
      formatter(dir);
    }
    dir.close();
    parent.add(name, sector);
  }

  const baseFormat = [
    formatterDir('bin', [
      formatterFile('lscsh.lsc', luscsh),
      formatterFile('boot.lsc', boot),
      formatterFile('test.lsc', test)
    ]),
    formatterDir('etc'),
    formatterDir('home', [
      formatterDir('guest')
    ]),
    formatterDir('lib')
  ];

  const format = () => {
    disk.wipe();
    const sector = Directory.create(null, Directory.ROOT_SECTOR);
    const root = Directory.open(sector);

    for (const formatter of baseFormat) {
      formatter(root);
    }

    root.close();
    disk.isFormatted = true;
  };

  return process => class BoundFS {
    static init() {
      if (!disk.formatted) {
        format(disk);
      }

      const rootFNode = FNode.open(Directory.ROOT_SECTOR);
      const root = new Directory(rootFNode);
      process.cwd = root;
    }

    static create(name) {
      const { dir, basename } = BoundFS.resolve(name);
      if (!dir) {
        return false;
      }

      if (dir.lookup(basename)) {
        dir.close();
        return false;
      }

      const sector = File.create(basename, dir.id);
      dir.add(basename, sector);
      dir.close();
      return true;
    }

    static open(name) {
      const { dir, basename } = BoundFS.resolve(name);
      if (!dir) {
        return null;
      }

      const entry = dir.lookup(basename);
      dir.close();
      if (!entry) {
        return null;
      }

      const fnode = FNode.open(entry.sector);
      return fnode.isDir ? new Directory(fnode) : new File(fnode);
    }

    static remove(name) {
      const { dir, basename } = BoundFS.resolve(name);
      if (!dir) {
        return false;
      }

      const success = dir.remove(basename);
      dir.close();
      return success;
    }

    static mkdir(name) {
      const { dir, basename } = BoundFS.resolve(name);
      if (!dir) {
        return false;
      }

      if (dir.lookup(basename)) {
        dir.close();
        return false;
      }

      const sector = Directory.create(basename, dir.id);
      dir.add(basename, sector);

      const newDir = Directory.open(sector);
      newDir.close();
      dir.close();
      return true;
    }

    static chdir(name) {
      const { dir, basename } = BoundFS.resolve(name);
      if (!dir) {
        return false;
      }

      const entry = dir.lookup(basename);
      if (!entry) {
        dir.close();
        return false;
      }

      const fnode = FNode.open(entry.sector);
      if (!fnode.isDir) {
        fnode.close();
        dir.close();
        return false;
      }

      const newCwd = new Directory(fnode);
      process.cwd.close();
      process.cwd = newCwd;
      dir.close();
      return true;
    }

    static getAbsolutePath(name) {
      if (name[0] === '/') {
        return name;
      }
      return path.join(BoundFS.getCwdPath(), name);
    }

    static getCwdPath() {
      let cwdPath = '';
      let dir = process.cwd.reOpen();
      while (dir.id !== Directory.ROOT_SECTOR) {
        cwdPath = `${dir.basename}/${cwdPath}`;
        const parentSector = dir.lookup('..').sector;
        dir.close();
        dir = Directory.open(parentSector);
      }
      dir.close();
      return `/${cwdPath}`;
    }

    static resolve(name) {
      const tokens = name.split('/').filter(Boolean);
      const basename = tokens.pop() || '.';

      let currDir;
      if (name[0] === '/') {
        currDir = Directory.open(Directory.ROOT_SECTOR);
      } else {
        currDir = process.cwd.reOpen();
      }

      let nextDir;
      for (const token of tokens) {
        const entry = currDir.lookup(token);
        currDir.close();

        if (!entry) {
          return {};
        }

        const fnode = FNode.open(entry.sector);
        if (!fnode.isDir) {
          fnode.close();
          return {};
        }
        currDir = new Directory(fnode);
      }

      return { dir: currDir, basename };
    }
  };
};

export default FileSystem;