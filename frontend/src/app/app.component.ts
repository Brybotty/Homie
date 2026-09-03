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
    // Restaurar sesión al recargar la página (lee el JWT del localStorage)
    await this.auth.loadCurrentUser();
  }
}
