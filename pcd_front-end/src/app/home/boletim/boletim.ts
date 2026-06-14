import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../service/api';

const MATERIA_EMOJIS: Record<string, string> = {
  'Português': '📖',
  'Matemática': '🔢',
  'História': '🏛️',
  'Geografia': '🌍',
  'Ciências': '🔬',
  'Inglês': '🌐',
  'Educação Física': '⚽',
  'Artes': '🎨',
};

@Component({
  selector: 'app-boletim',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boletim.html',
  styleUrl: './boletim.scss',
})
export class Boletim implements OnInit {

  usuario: any = null;
  iniciais: string = '';
  sidebarCollapsed: boolean = false;
  totalNaoLidos: number = 0;
  totalTarefas: number = 0;
  bimestreSelecionado: number = 1;
  boletim: any[] = [];
  carregando: boolean = true;

  get mediaGeral(): number {
    const notas = this.boletim.filter(i => i.nota !== null).map(i => parseFloat(i.nota));
    if (notas.length === 0) return 0;
    return notas.reduce((a, b) => a + b, 0) / notas.length;
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
      : partes[0]?.[0] || '?'
    ).toUpperCase();

    this.carregarBoletim();
    this.carregarTotalRecadosNaoLidos();
    this.carregarTotalTarefas();
  }

  async carregarBoletim(): Promise<void> {
    this.carregando = true;
    this.cdr.detectChanges();
    const res = await this.api.get(`/boletim/${this.usuario.id}?bimestre=${this.bimestreSelecionado}`);
    if (res.status) {
      this.boletim = res.dados.boletim;
    } else {
      this.boletim = [];
    }
    this.carregando = false;
    this.cdr.detectChanges();
  }

  async carregarTotalRecadosNaoLidos(): Promise<void> {
    const res = await this.api.get(`/recados/aluno/${this.usuario.id}`);
    if (res.status) {
      this.totalNaoLidos = (res.dados.recados || []).filter((r: any) => r.lido === 0 || r.lido === false).length;
      this.cdr.detectChanges();
    }
  }

  async carregarTotalTarefas(): Promise<void> {
    const res = await this.api.get(`/tarefas/aluno/${this.usuario.id}`);
    if (res.status) {
      const pendentes = (res.dados.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false);
      this.totalTarefas = pendentes.length;
      this.cdr.detectChanges();
    }
  }

  selecionarBimestre(b: number): void {
    this.bimestreSelecionado = b;
    this.carregarBoletim();
  }

  getMateriaEmoji(materia: string): string {
    return MATERIA_EMOJIS[materia] || '📚';
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}