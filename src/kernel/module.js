import path from 'path-browserify';

export class ExitIndicator extends Error { 
  constructor(status, err) {
    super();
    this.status = status;
    if (err) {
      err.status = status;
      this.err = err;
    }
  }
};

export class LuscModuleNotFound extends Error {
  constructor(filename) {
    super(`target of $import not found: ${filename}`);
    this.filename = filename;
  }
}

export class LuscModuleLoadDir extends Error {
  constructor(filename) {
    super(`target of $import is a directory: ${filename}`);
    this.filename = filename;
  }
}

const Module = ({ File, FNode }, system, kernel) => process => {
  
  const $io = {
    input: {
      on: kernel.input.bind(process.pid)
    },
    output: {
      emit: kernel.output.bind(process.pid)
    }
  };

  const $process = {
    pid: process.pid,
    env: process.env,
    argv: process.argv,
    exit: process.exit,
    exec: process.exec,
    cwd: () => process.fs.getCwdPath()
  };

  return class _Module {
    static cache = {};

    static load(filepath, parent=null) {
      const file = process.fs.open(filepath);
      if (!file) {
        throw new LuscModuleNotFound(filepath);
      }

      if (!(file instanceof File)) {
        file.close();
        throw new LuscModuleLoadDir(filepath);
      }

      const id = file.id;

      if (_Module.cache[id]) {
        file.close();
        return _Module.cache[id].module.exports;
      }

      const basename = path.basename(filepath);
      const dirname = path.dirname(filepath);

      const m = new _Module(id, process.fs.getAbsolutePath(dirname), basename, file.read(), parent);
      _Module.cache[id] = m;

      file.close();
      return m.run();
    }

    static build(id, filename, src) {
      return _Module.quaranteen(id, filename, src);
    }

    static quaranteen(id, filename, src) {
      const wrapped = `'use strict';\nconst { $self, $process, $import, $export, $io } = $lsc;\n(function module_${id}($lsc) {\n\n/* BEGIN_MODULE: ${filename} */\n\n${src}\n/* END_MODULE */\n\n})();`;
      const runnable = new Function(
        '$lsc',
        'window',
        'self',
        wrapped
      );
      return runnable;
    }

    constructor(id, dirname, filename, src, parent) {
      this.module = {
        parent,
        id: id,
        exports: {}
      };

      this.$self = {
        dirname,
        filename,
        module: this.module
      };

      this.runnable = _Module.build(id, filename, src);
    }

    run() {
      const $import = filepath => {
        if (filepath[0] !== '/') {
          filepath = path.join(this.$self.dirname, filepath);
        }

        return _Module.load(filepath, this.$self);
      };

      const $export = exports => {
        Object.assign(this.module.exports, exports);
      };

      try {
        const runnable = this.runnable;
        runnable({
          $self: this.$self, 
          $process, $import, $export, $io
        });
        return this.module.exports;
      } catch (err) {
        _Module.cache[this.module.id] = null;
        delete _Module.cache[this.module.id];
        throw err;
      }
    }
  }
};

export default Module;
