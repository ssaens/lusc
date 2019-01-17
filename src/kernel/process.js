import _Module, { ExitIndicator } from './module';

const Process = (classes, system, kernel) => {

  const bindModule = _Module(classes, system, kernel);

  return class _Process {
    static pid = 0;

    constructor(argv, parent) {
      this.argv = argv;
      this.parent = parent;
      this.pid = ++_Process.pid;
      this.env = {};
      this.fs = kernel.bindFS(this);
      if (parent) {
        this.cwd = parent.cwd.reOpen();
      } else {
        this.fs.init();
      }
    }

    start() {
      const path = this.argv[0];
      try {
        const module = bindModule(this).load(path);
      } catch (err) {
        if (err instanceof ExitIndicator) {
          throw err;
        }
        this.exit(1, err);
      }
    }

    exit = (status, err=null) => {
      this.cwd.close();
      kernel.exitProcess(this.pid);
      throw new ExitIndicator(status, err);
    }

    exec = cmd => {
      const argv = cmd.split(' ').filter(Boolean);
      const p = new _Process(argv, this);
      return new Promise((resolve, reject) => {
        try {
          kernel.switchProcess(p);
        } catch (exit) {
          if (!(exit instanceof ExitIndicator)) {
            throw new Error('Child process experienced unhandled error');
          }
          return exit.err ? reject(exit.err) : resolve(exit.status);
        }
      });
    }
  }
};

export default Process;
