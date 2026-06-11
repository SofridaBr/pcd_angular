import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss'
})
export class Configuracoes implements OnInit {

  totalTarefas = 0;
  totalRecados = 0;
  usuario: any = null;
  iniciais = '';
  sidebarCollapsed = false;
  abaAtiva: 'sobre' | 'privacidade' | 'termos' | 'suporte' = 'sobre';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    this.carregarTotalTarefas();
    this.carregarTotalRecados();
  }

  carregarTotalTarefas(): void {
    this.http.get<any>(`${API}/tarefas/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalTarefas = (res.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  carregarTotalRecados(): void {
    this.http.get<any>(`${API}/recados/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalRecados = (res.recados || []).filter((r: any) => r.lido === 0 || r.lido === false).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  get isProfessor(): boolean {
    return ['professor', 'coordenador', 'apoio', 'responsavel'].includes(this.usuario?.tipo);
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}