import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  title = 'homie-frontend';

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    // Si hay un token guardado, valida y sincroniza el perfil con el backend en segundo plano
    if (this.auth.getToken()) {
      await this.auth.loadCurrentUser();
    }
  }
}
