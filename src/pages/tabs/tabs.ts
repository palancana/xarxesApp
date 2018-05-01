import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { FavoritesPage } from '../favorites/favorites';
import { SearchPage } from '../search/search';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = FavoritesPage;
  tab2Root = SearchPage;
  tab3Root = AboutPage;

  constructor() {

  }
}
