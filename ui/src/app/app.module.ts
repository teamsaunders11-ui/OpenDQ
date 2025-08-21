
import { AppComponent } from './app';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
  provideRouter(routes)
  ]
});
