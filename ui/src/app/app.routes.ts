
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ConnectionsComponent } from './connections.component';
import { CatalogComponent } from './catalog.component';
import { RulesComponent } from './rules.component';
import { LineageComponent } from './lineage.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'connections', component: ConnectionsComponent },
	{ path: 'catalog', component: CatalogComponent },
	{ path: 'rules', component: RulesComponent },
	{ path: 'lineage', component: LineageComponent },
];
