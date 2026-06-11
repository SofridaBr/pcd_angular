import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const API = 'http://localhost:3000';

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
  imports: [CommonModule, RouterModule, HttpClientModule],
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?'
    ).toUpperCase();

    this.carregarBoletim();
    this.carregarTotalRecadosNaoLidos();
    this.carregarTotalTarefas();
  }

  carregarBoletim(): void {
    this.carregando = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${API}/boletim/${this.usuario.id}?bimestre=${this.bimestreSelecionado}`).subscribe({
      next: (res) => {
        this.boletim = res.boletim;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.boletim = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarTotalRecadosNaoLidos(): void {
    this.http.get<any>(`${API}/recados/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalNaoLidos = (res.recados || []).filter((r: any) => r.lido === 0 || r.lido === false).length;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  carregarTotalTarefas(): void {
    this.http.get<any>(`${API}/tarefas/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        const pendentes = (res.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false);
        this.totalTarefas = pendentes.length;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
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
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}