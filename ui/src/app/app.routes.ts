
import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ConnectionsComponent } from './connections.component';
import { CatalogComponent } from './catalog.component';
import { RulesComponent } from './rules.component';
import { LineageComponent } from './lineage.component';
import { GovernanceComponent } from './governance.component';
import { DataQualityComponent } from './data-quality.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'governance', component: GovernanceComponent },
	{ path: 'data-quality', component: DataQualityComponent },
	{ path: 'connections', component: ConnectionsComponent },
	{ path: 'catalog', component: CatalogComponent },
	{ path: 'rules', component: RulesComponent },
	{ path: 'lineage', component: LineageComponent },
];
