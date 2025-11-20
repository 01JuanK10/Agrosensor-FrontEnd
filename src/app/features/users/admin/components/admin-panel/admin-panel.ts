import { Component } from '@angular/core';
import { UserTopbar } from "../../../core/components/user-topbar/user-topbar";
import { UserSidebar } from "../../../core/components/user-sidebar/user-sidebar";

@Component({
  selector: 'app-admin-panel',
  imports: [UserTopbar, UserSidebar],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {

}
