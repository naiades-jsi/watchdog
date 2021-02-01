import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FrameComponent } from '../../components/frame/frame.component';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';

const routes: Routes = [{
  path: '',
  component: FrameComponent,
  children: [
    { path: '', component: DashboardComponent },
  ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
