import { Component } from '@angular/core';
import { UserTopbar } from "../../core/components/user-topbar/user-topbar";
import { UserSidebar } from "../../core/components/user-sidebar/user-sidebar";
import { Footer } from "../../../core/footer/footer";

@Component({
  selector: 'app-client-panel',
  imports: [UserTopbar, UserSidebar, Footer],
  templateUrl: './client-panel.html',
  styleUrl: './client-panel.scss',
})
export class ClientPanel {

}
