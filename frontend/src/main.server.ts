import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => {
  return bootstrapApplication(AppComponent, config).catch(err => {
    console.error('Error during Angular SSR bootstrap:', err);
    throw err;
  });
};

export default bootstrap;
