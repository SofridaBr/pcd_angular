import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-informacoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './informacoes.html',
  styleUrl: './informacoes.scss',
})
export class Informacoes implements OnInit {

  sidebarCollapsed = false;
  usuario: any = null;
  iniciais = '';
  totalTarefas = 0;
  totalRecadosNaoLidos = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
    this.carregarTarefas();
    this.carregarRecados();
  }

  async carregarTarefas(): Promise<void> {
    if (!this.usuario?.id) return;
    try {
      const res = await fetch(`${API}/tarefas/aluno/${this.usuario.id}`);
      if (res.ok) {
        const dados = await res.json();
        const pendentes = (dados.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false);
        this.totalTarefas = pendentes.length;
        this.cdr.detectChanges();
      }
    } catch {}
  }

  async carregarRecados(): Promise<void> {
    if (!this.usuario?.id) return;
    try {
      const res = await fetch(`${API}/recados/aluno/${this.usuario.id}`);
      if (res.ok) {
        const dados = await res.json();
        const naoLidos = (dados.recados || []).filter((r: any) => r.lido === 0 || r.lido === false);
        this.totalRecadosNaoLidos = naoLidos.length;
        this.cdr.detectChanges();
      }
    } catch {}
  }

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair() {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  maskCpf(cpf: string | undefined): string {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}