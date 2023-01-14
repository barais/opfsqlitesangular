import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'demoAngularSqlLite';

  ngOnInit(): void {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./dbsqlite.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        switch (data.type) {
          case 'log':
            this.logHtml(data.payload.cssClass, ...data.payload.args);
            break;
          default:
            this.logHtml('error', 'Unhandled message:', data.type);
        }
        console.error(data.payload.args)
      };
      worker.postMessage({msg:'load'});
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

   logHtml (cssClass:any, ...args:any) {
    const ln = document.createElement('div');
    if (cssClass) {
      ln.classList.add(cssClass);
    }
    ln.append(document.createTextNode(args.join(' ')));
    document.body.append(ln);
  };
}
