const FNode = disk => class _FNode {
  constructor(extent) {
    this.extent = extent;
    this.openCount = 1;
    this.removed = false;
  }

  close() {
    if (--this.openCount > 0) {
      return;
    }

    _FNode.openFNodes[this.sector] = null;
    delete _FNode.openFNodes[this.sector];
    if (this.removed) {
      this.extent = null;
      disk.freeExtent(this.sector);
    }
  }

  remove() {
    this.removed = true;
  }

  reOpen() {
    ++this.openCount;
    return this;
  }

  get sector() {
    return this.extent.sector;
  }

  get isDir() {
    return this.extent.isDir;
  }

  static openFNodes = {};

  static create(data, isDir=false) {
    return disk.allocateExtent(data, isDir);
  }

  static open(sector) {
    if (_FNode.openFNodes[sector]) {
      const fnode = _FNode.openFNodes[sector];
      ++fnode.openCount;
      return fnode;
    }
    const extent = disk.getExtent(sector);
    const fnode = new _FNode(extent);
    _FNode.openFNodes[sector] = fnode;
    return fnode;
  }

  static free(sector) {
    disk.freeExtent(sector);
  }
};

export default FNode;
