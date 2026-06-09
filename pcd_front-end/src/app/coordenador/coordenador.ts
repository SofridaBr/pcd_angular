import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coordenador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coordenador.html',
  styleUrl: './coordenador.scss'
})
export class Coordenador implements OnInit {

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  // ═══════════════════════════════════════
  // USUÁRIO
  // ═══════════════════════════════════════

  usuario: any = null;
  dataHoje: string = '';

  // ═══════════════════════════════════════
  // DADOS DA ESCOLA
  // ═══════════════════════════════════════

  stats: any = {
    totalAlunos: 0,
    totalProfessores: 0,
    totalResponsaveis: 0,
    condicoes: {
      Visual: 0,
      Auditiva: 0,
      Cognitiva: 0,
      Fisica: 0,
      Nenhuma: 0
    }
  };

  turmas: any[] = [];
  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  mensagens: any[] = [];

  carregandoStats = true;
  carregandoAlunos = true;
  carregandoTurmas = true;
  carregandoMensagens = true;

  filtroAtual: string = 'Todos';
  sidebarAberta = true;

  // variáveis do modal
  modalAberto = false;
  alunoSelecionado: any = null;
  boletimAluno: any[] = [];
  carregandoBoletim = false;
  bimestreSelecionado = 1;

  get mediaGeral(): number {
    const notas = this.boletimAluno.filter(i => i.nota !== null).map(i => parseFloat(i.nota));
    if (notas.length === 0) return 0;
    return notas.reduce((a, b) => a + b, 0) / notas.length;
  }

  abrirBoletim(aluno: any): void {
    this.alunoSelecionado = aluno;
    this.modalAberto = true;
    this.bimestreSelecionado = 1;
    this.carregarBoletimAluno();
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.alunoSelecionado = null;
    this.boletimAluno = [];
  }

  carregarBoletimAluno(): void {
    this.carregandoBoletim = true;
    fetch(`http://localhost:3000/boletim/${this.alunoSelecionado.id}?bimestre=${this.bimestreSelecionado}`)
      .then(r => r.json())
      .then(res => {
        this.ngZone.run(() => {
          this.boletimAluno = res.boletim || [];
          this.carregandoBoletim = false;
          this.cdr.detectChanges();
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.boletimAluno = [];
          this.carregandoBoletim = false;
          this.cdr.detectChanges();
        });
      });
  }

  selecionarBimestre(b: number): void {
    this.bimestreSelecionado = b;
    this.carregarBoletimAluno();
  }

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(raw);

    if (this.usuario.tipo !== 'coordenador') {
      this.router.navigate(['/login']);
      return;
    }

    const agora = new Date();
    this.dataHoje = agora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

        

    this.carregarStats();
    this.carregarTurmas();
    this.carregarAlunos();
    this.carregarMensagens();
  }

  // ═══════════════════════════════════════
  // CARREGAR DADOS
  // ═══════════════════════════════════════

  async carregarStats(): Promise<void> {
    try {
      const res = await fetch('http://localhost:3000/escola/stats');
      const dados = await res.json();
      this.ngZone.run(() => {
        this.stats = dados;
        this.carregandoStats = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.ngZone.run(() => {
        this.carregandoStats = false;
        this.cdr.detectChanges();
      });
      console.error('Erro ao carregar stats');
    }
  }

  async carregarTurmas(): Promise<void> {
    try {
      const res = await fetch('http://localhost:3000/escola/turmas');
      const dados = await res.json();
      this.ngZone.run(() => {
        this.turmas = dados.turmas || [];
        this.carregandoTurmas = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.ngZone.run(() => {
        this.carregandoTurmas = false;
        this.cdr.detectChanges();
      });
      console.error('Erro ao carregar turmas');
    }
  }

  async carregarAlunos(): Promise<void> {
    try {
      const res = await fetch('http://localhost:3000/alunos/todos');
      const dados = await res.json();
      this.ngZone.run(() => {
        this.alunos = dados.alunos || [];
        this.alunosFiltrados = [...this.alunos];
        this.carregandoAlunos = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.ngZone.run(() => {
        this.carregandoAlunos = false;
        this.cdr.detectChanges();
      });
      console.error('Erro ao carregar alunos');
    }
  }

  async carregarMensagens(): Promise<void> {
    try {
      const res = await fetch(`http://localhost:3000/recados/coordenador/${this.usuario.id}`);
      const dados = await res.json();
      this.ngZone.run(() => {
        this.mensagens = (dados.recados || []).slice(0, 5);
        this.carregandoMensagens = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.ngZone.run(() => {
        this.carregandoMensagens = false;
        this.cdr.detectChanges();
      });
      console.error('Erro ao carregar mensagens');
    }
  }

  // ═══════════════════════════════════════
  // FILTROS DE ALUNOS
  // ═══════════════════════════════════════

  filtrarAlunos(filtro: string): void {
    this.filtroAtual = filtro;
    if (filtro === 'Todos') {
      this.alunosFiltrados = [...this.alunos];
    } else if (filtro === 'Ativos') {
      this.alunosFiltrados = this.alunos.filter(a => a.progresso > 0);
    }
  }

  // ═══════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════

  getProgressoClass(progresso: number): string {
    if (progresso >= 70) return 'bom';
    if (progresso >= 40) return 'medio';
    return 'critico';
  }

  getCondicaoBadgeClass(condicao: string): string {
    const map: any = {
      'TEA': 'badge-tea',
      'Autismo Nível 1': 'badge-tea',
      'Autismo Nível 2': 'badge-tea',
      'Autismo Nível 3': 'badge-tea',
      'Deficiência Visual': 'badge-visual',
      'Deficiência Auditiva': 'badge-auditiva',
      'Deficiência Física': 'badge-fisica',
      'Deficiência Intelectual': 'badge-cognitiva',
      'TDAH': 'badge-tdah',
      'Dislexia': 'badge-dislexia',
      'Síndrome de Down': 'badge-down',
      'Paralisia Cerebral': 'badge-pc',
      'Nenhuma': 'badge-nenhuma'
    };
    return map[condicao] || 'badge-outra';
  }

  getCondicaoAbrev(condicao: string): string {
    const map: any = {
      'Autismo Nível 1': 'TEA N1',
      'Autismo Nível 2': 'TEA N2',
      'Autismo Nível 3': 'TEA N3',
      'Deficiência Visual': 'D.Visual',
      'Deficiência Auditiva': 'D.Audit.',
      'Deficiência Física': 'D.Física',
      'Deficiência Intelectual': 'D.Intel.',
      'Paralisia Cerebral': 'PC',
      'Síndrome de Down': 'SD',
    };
    return map[condicao] || condicao;
  }

  getIniciais(nome: string): string {
    return nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  formatarHora(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  toggleSidebar(): void {
    this.sidebarAberta = !this.sidebarAberta;
  }

  sair(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }

  irParaRecados(): void {
    this.router.navigate(['/coordenador/comunicacao']);
  }

  getNoteClass(nota: any): string {
    const n = parseFloat(nota);
    if (isNaN(n)) return '';
    if (n >= 7) return 'nota-boa';
    if (n >= 5) return 'nota-media';
    return 'nota-ruim';
  }
}