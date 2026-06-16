import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coordenador-configuracoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coordenador-configuracoes.html',
  styleUrl: './coordenador-configuracoes.scss'
})
export class CoordenadorConfiguracoes implements OnInit {

  usuario: any = null;
  sidebarAberta = true;
  abaAtiva: 'sobre' | 'privacidade' | 'termos' | 'suporte' = 'sobre';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    if (this.usuario.tipo !== 'coordenador') {
      this.router.navigate(['/login']);
    }
  }

  getIniciais(nome: string): string {
    return nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  toggleSidebar(): void { this.sidebarAberta = !this.sidebarAberta; }

  sair(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void { this.router.navigate([rota]); }
}