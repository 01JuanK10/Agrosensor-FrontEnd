import { Component } from '@angular/core';
import { UserTopbar } from "../../../core/components/user-topbar/user-topbar";
import { UserSidebar } from "../../../core/components/user-sidebar/user-sidebar";
import { Footer } from "../../../../core/footer/footer";

@Component({
  selector: 'app-admin-panel',
  imports: [UserTopbar, UserSidebar, Footer],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {

}
