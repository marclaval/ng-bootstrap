import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {NgbdModuleNgFactory} from './app/app.module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(NgbdModuleNgFactory);
