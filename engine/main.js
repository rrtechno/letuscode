import { ConfigService } from './config/config-service.js';
import { Logger } from './utils/logger.js';
import { installGlobalErrorHandler } from './utils/global-error-handler.js';
import { ThemeService } from './theme/theme-service.js';
import { eventBus } from './events/event-bus.js';
import { AppShell } from '../components/shell/app-shell.js';
import { Header } from '../components/header/header.js';
import { Sidebar } from '../components/sidebar/sidebar.js';
import { Breadcrumb } from '../components/breadcrumb/breadcrumb.js';
import { Modal } from '../components/modal/modal.js';
import { Router } from './router/router.js';
import { registerRoutes } from './router/route-registry.js';
import { ProgressService } from './progress/progress-service.js';
import { AchievementEngine } from './achievements/achievement-engine.js';
import { AchievementToast } from '../components/toast/achievement-toast.js';


/**
 * Boot sequence (documented order — Task 1.8):
 *  1. Global error handler installed first, so failures anywhere below are caught.
 *  2. Config loaded (everything else depends on tracks.json / app.config.json).
 *  3. Logger level + Theme applied from config/preferences.
 *  4. Core services with no DOM dependency (ProgressService's event subscription).
 *  5. Shell + persistent chrome components mounted.
 *  6. Router started last, once everything it might call into exists.
 */
async function bootstrap() {
  installGlobalErrorHandler();
  AchievementEngine.init();
  AchievementToast.init();
  eventBus.on('app:fatalError', ({ error }) => {
    renderFatalError(error);
  });

  let config;
  try {
    config = await ConfigService.load();
  } catch (err) {
    renderFatalError(err, 'We had trouble loading Let Us Code. Please refresh the page.');
    return;
  }

  Logger.setLevel(config.app.logLevel);
  ThemeService.initFromStoredPreference();
  ProgressService.init();

  const appRoot = document.getElementById('app-root');
  AppShell.mount(appRoot);
  Modal.registerAppRoot(appRoot);

  Header.mount(AppShell.getHeaderEl());
  Header.onMenuToggle(() => AppShell.toggleSidebar());
  Sidebar.mount(AppShell.getSidebarEl());
  Breadcrumb.mount(AppShell.getBreadcrumbEl());

  registerRoutes();
  Router.start(AppShell.getMainEl());

  Logger.info(`${config.app.appName} v${config.app.version} ready.`);
}

function renderFatalError(error, message = 'Something went wrong and we need to reload.') {
  console.error(error);
  const root = document.getElementById('app-root') || document.body;
  root.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'luc-fatal-error';
  box.innerHTML = `
    <h1>Oops!</h1>
    <p>${message}</p>
    <button id="luc-reload-btn">Reload</button>
  `;
  root.appendChild(box);
  document.getElementById('luc-reload-btn').addEventListener('click', () => window.location.reload());
}

bootstrap();
