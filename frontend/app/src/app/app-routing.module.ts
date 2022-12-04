import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { ScanComponent } from './scan/scan.component';

const routes: Routes = [
  { path: '/', component: AppComponent },
  { path: '/menu', component: MenuComponent },
  { path: '/scan', component: ScanComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
