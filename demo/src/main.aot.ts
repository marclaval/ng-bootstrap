import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {NgbdModuleNgFactory} from './app/app.module.ngfactory';

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

platformBrowser().bootstrapModuleFactory(NgbdModuleNgFactory);
