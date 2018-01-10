function extent(isDir=false, data=null) {
    return { isDir, data };
}

class Disk {
    constructor() {
        this.nextBlock = 0;
        this.disk = {};
    }

    allocateExtent() {
        const sector = this.nextBlock++;
        this.disk[sector] = extent();
        return sector;
    }

    getExtent(sector) {
        return this.disk[sector];
    }

    freeExtent(sector) {
        this.disk[sector] = null;
        delete this.disk[sector];
    }

    dump() {
        return JSON.stringify({
            nextBlock: this.nextBlock,
            disk: this.disk
        });
    }

    static fromDump(dump) {
        const meta = JSON.parse(dump);
        const d = new Disk();
        d.nextBlock = meta.nextBlock;
        d.disk = meta.disk;
        return d;
    }
}

export default Disk;
