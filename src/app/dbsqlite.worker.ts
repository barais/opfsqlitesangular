/// <reference lib="webworker" />

addEventListener('message', ( e ) => {
  console.error(e);

  switch (e.data.msg) {
    case 'hello': {
      const response = `worker response to ${e.data.msg}`;
      postMessage({ msg: response });
      break;
    }
  case 'load': {
    // Import Webassembly script
    //self.importScripts('./content/opencv/4/opencv.js')
    const self1 = self as any;
    self1['Module'] = {
      scriptUrl: '/assets/sqlite/sqlite3.js',
    };

    //Load and await the .js OpenCV
    self1.importScripts(self1['Module'].scriptUrl);
    let db1 = new DB();

    self1
    .sqlite3InitModule({
      print: db1.log,
      printErr: db1.error,
    })
    .then(function (sqlite3: any) {
      db1.log('Done initializing. Running demo...');
      try {
        db1.start(sqlite3);
      } catch (e1:any) {
        db1.error('Exception:', e1.message);
      }
    });

    break;
  }
}

});



class DB {
  db: any;
  counter= 0;
  logHtml (cssClass: string, ...args: any[]) {
    postMessage({
      type: 'log',
      payload: { cssClass, args },
    });
  };
  log(...args: (string | number)[]) {
    this.logHtml('', ...args);

  }
  error (...args: string[]) { this.logHtml('error', ...args) }

   start(sqlite3: any) {
    const capi = sqlite3.capi; /*C-style API*/
    const oo = sqlite3.oo1; /*high-level OO API*/
    this.log('sqlite3 version', capi.sqlite3_libversion(), capi.sqlite3_sourceid());
    if (sqlite3.opfs) {
      console.error(sqlite3.opfs)
      this.db = new oo.OpfsDb('/mydb.sqlite3');
      this.log('The OPFS is available.');
    } else {
      this.db = new oo.DB('/mydb.sqlite3', 'ct');
      this.log('The OPFS is not available.');
    }
    this.log('transient db =', this.db.filename);

    try {
      this.log('Create a table...');
      this.db.exec('CREATE TABLE IF NOT EXISTS t2(a,b)');
      this.log('Insert some data using exec()...');
      let i;
      for (i = 20; i <= 25; ++i) {
        this.db.exec({
          sql: 'INSERT INTO t2(a,b) VALUES (?,?)',
          bind: [i, i * 2],
        });
      }
      this.log("Query data with exec() using rowMode 'array'...");
      this.db.exec({
        sql: 'SELECT a FROM t ORDER BY a LIMIT 3',
        rowMode: 'array', // 'array' (default), 'object', or 'stmt'
        callback: (row: any)=> {
          this.log('row ', ++this.counter, '=', row);
        },
      });
    } finally {
      this.db.close();
    }
  };

}




