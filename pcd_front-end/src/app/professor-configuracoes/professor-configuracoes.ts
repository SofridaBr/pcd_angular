import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-professor-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professor-configuracoes.html',
  styleUrl: './professor-configuracoes.scss'
})
export class ProfessorConfiguracoes implements OnInit {

  usuario: any = null;
  iniciais = '';
  abaAtiva: 'sobre' | 'privacidade' | 'termos' | 'suporte' = 'sobre';
  sidebarCollapsed = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}