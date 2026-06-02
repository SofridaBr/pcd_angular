import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss'
})
export class Configuracoes implements OnInit {

  usuario: any = null;
  iniciais = '';
  sidebarCollapsed = false;
  abaAtiva: 'sobre' | 'privacidade' | 'termos' | 'suporte' = 'sobre';

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  get isProfessor(): boolean {
  return this.usuario?.tipo === 'professor' || 
         this.usuario?.tipo === 'coordenador' || 
         this.usuario?.tipo === 'apoio' || 
         this.usuario?.tipo === 'responsavel';
}
}