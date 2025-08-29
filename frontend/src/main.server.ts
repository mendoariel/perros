import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Override environment for server-side rendering
import { environment as serverEnv } from './environments/environment.server';
import { environment as clientEnv } from './environments/environment.production';

// Use server environment for SSR
Object.assign(clientEnv, serverEnv);

const bootstrap = () => {
  return bootstrapApplication(AppComponent, config).catch(err => {
    console.error('Error during Angular SSR bootstrap:', err);
    throw err;
  });
};

export default bootstrap;
