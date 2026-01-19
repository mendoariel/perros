import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Override environment for server-side rendering
import { environment as serverEnv } from './environments/environment.server';
// Import the base environment (will be replaced by Angular build based on configuration)
import { environment as clientEnv } from './environments/environment';

// Use server environment for SSR - this ensures SSR uses the correct backend URL
// The serverEnv uses environment variables to determine the backend host
Object.assign(clientEnv, serverEnv);

const bootstrap = () => {
  return bootstrapApplication(AppComponent, config).catch(err => {
    console.error('Error during Angular SSR bootstrap:', err);
    throw err;
  });
};

export default bootstrap;
