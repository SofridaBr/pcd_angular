import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../service/api';

@Component({
  selector: 'app-recados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recados.html',
  styleUrl: './recados.scss',
})
export class Recados implements OnInit {

  usuario: any = null;
  iniciais: string = '';
  sidebarCollapsed: boolean = false;
  recados: any[] = [];
  carregando: boolean = true;
  totalTarefas: number = 0;

  get totalNaoLidos(): number {
    return this.recados.filter(r => r.lido === 0 || r.lido === false).length;
  }

  constructor(private api: Api, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const usuarioToken = this.api.getUsuario();
    if (!usuarioToken) { window.location.href = '/login'; return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuarioToken;

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
    this.carregarRecados();
  }

  async carregarTotalTarefas(): Promise<void> {
    const res = await this.api.get(`/tarefas/aluno/${this.usuario.id}`);
    if (res.status) {
      const pendentes = (res.dados.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false);
      this.totalTarefas = pendentes.length;
      this.cdr.detectChanges();
    }
  }

  async carregarRecados(): Promise<void> {
    this.carregarTotalTarefas();
    this.carregando = true;
    this.cdr.detectChanges();
    const res = await this.api.get(`/recados/aluno/${this.usuario.id}`);
    if (res.status) {
      this.recados = (res.dados.recados || []).map((r: any) => ({ ...r, aberto: false }));
    } else {
      this.recados = [];
    }
    this.carregando = false;
    this.cdr.detectChanges();
  }

  async marcarLido(recado: any): Promise<void> {
    recado.aberto = !recado.aberto;

    if (recado.lido === 0 || recado.lido === false) {
      recado.lido = 1; // atualiza visual imediatamente
      this.cdr.detectChanges();

      const res = await this.api.patch(`/recados/${recado.id}/lido`, { usuarioId: this.usuario.id });
      if (!res.status) {
        recado.lido = 0; // reverte se falhou
        this.cdr.detectChanges();
      }
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    const hoje = new Date();
    const diffH = Math.floor((hoje.getTime() - d.getTime()) / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffH < 1) return 'Agora mesmo';
    if (diffH < 24) return `${diffH}h atrás`;
    if (diffD === 1) return 'Ontem';
    if (diffD < 7) return `${diffD} dias atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}