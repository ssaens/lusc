class Disk {
  constructor() {
    this.disk = {};
    this.isFormatted = false;
    this.nextBlock = 0;
  }

  allocateExtent(data, isDir) {
    const sector = this.nextBlock++;
    const extent = Disk.createExtent(sector, data, isDir);
    this.disk[sector] = extent;
    return sector;
  }

  getExtent(sector) {
    return this.disk[sector];
  }

  freeExtent(sector) {
    this.disk[sector] = null;
    delete this.disk[sector];
  }

  wipe() {
    this.disk = {};
    this.nextBlock = 0;
  }

  dump() {
    return JSON.stringify({
      nextBlock: this.nextBlock,
      isFormatted: this.isFormatted,
      disk: this.disk
    });
  }

  static fromDump(dump) {
    const { nextBlock, isFormatted, disk } = JSON.parse(dump);
    const d = new Disk();
    d.nextBlock = nextBlock;
    d.isFormatted = formatted;
    d.disk = disk;
    return d;
  }

  static createExtent(sector, data, isDir) {
    return {
      sector,
      isDir,
      data
    }
  }
}

export default Disk;
