import { AppComponent } from './app';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
});
