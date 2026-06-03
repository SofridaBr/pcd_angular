import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-familiar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './familiar.html',
  styleUrl: './familiar.scss',
})
export class Familiar implements OnInit {

  private readonly API = 'http://localhost:3000';

  // ═══════════════════════════════════════
  // USUÁRIO LOGADO
  // ═══════════════════════════════════════

  usuario: any = null;
  dataAtual: string = '';

  get inicialNome(): string {
    return this.usuario?.nome?.[0]?.toUpperCase() ?? '?';
  }

  get primeiroNome(): string {
    return this.usuario?.nome?.split(' ')[0] ?? '';
  }

  // ═══════════════════════════════════════
  // NAVEGAÇÃO (ABAS)
  // ═══════════════════════════════════════

  abaAtual: string = 'home';

  setAba(aba: string): void {
    this.abaAtual = aba;

    if (aba === 'boletim') {
      this.carregarBoletins();
    }

    if (aba === 'recados') {
      this.carregarRecados();
    }
  }

  // ═══════════════════════════════════════
  // ALUNOS
  // ═══════════════════════════════════════

  alunos: any[] = [];
  buscaAluno: string = '';
  filtroAlunos: string = 'todos';

  get alunosFiltrados(): any[] {
    let lista = this.alunos;

    if (this.filtroAlunos === 'pcd') {
      lista = lista.filter(a => a.condicao && a.condicao !== 'Nenhuma');
    }

    if (this.buscaAluno.trim()) {
      const termo = this.buscaAluno.toLowerCase();
      lista = lista.filter(a => a.nome?.toLowerCase().includes(termo));
    }

    return lista;
  }

  get totalTarefasConcluidas(): number {
    return this.alunos.reduce((acc, a) => acc + (a.tarefasConcluidas ?? 0), 0);
  }

  get totalPcD(): number {
    return this.alunos.filter(a => a.condicao && a.condicao !== 'Nenhuma').length;
  }

  async carregarAlunos(): Promise<void> {
    try {
      const res = await fetch(`${this.API}/responsavel/alunos/${this.usuario.id}`);
      const dados = await res.json();

      if (res.ok) {
        this.alunos = dados;
      }
    } catch {
      console.error('Erro ao carregar alunos');
    }
  }

  // ═══════════════════════════════════════
  // DETALHE DO ALUNO (modal)
  // ═══════════════════════════════════════

  alunoSelecionado: any = null;

  verAluno(aluno: any): void {
    this.alunoSelecionado = aluno;
  }

  verBoletimAluno(aluno: any): void {
    this.alunoSelecionado = null;
    this.abaAtual = 'boletim';
    this.carregarBoletins();
  }

  // ═══════════════════════════════════════
  // MODAL — ADICIONAR ALUNO
  // ═══════════════════════════════════════

  modalAdicionarAberto: boolean = false;
  emailAlunoParaAdicionar: string = '';
  alertaAdicionar: string = '';

  abrirModalAdicionarAluno(): void {
    this.modalAdicionarAberto = true;
    this.emailAlunoParaAdicionar = '';
    this.alertaAdicionar = '';
  }

  fecharModalAdicionar(): void {
    this.modalAdicionarAberto = false;
    this.alertaAdicionar = '';
  }

  async adicionarAluno(): Promise<void> {
    const email = this.emailAlunoParaAdicionar.trim();

    if (!email) {
      this.alertaAdicionar = 'Informe o e-mail do aluno.';
      return;
    }

    try {
      const res = await fetch(`${this.API}/responsavel/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsavel_id: this.usuario.id,
          email_aluno: email
        })
      });

      const dados = await res.json();

      if (!res.ok) {
        this.alertaAdicionar = dados.mensagem || `Erro ${res.status}`;
        return;
      }

      this.alertaAdicionar = 'Aluno adicionado com sucesso!';
      await this.carregarAlunos();

      setTimeout(() => this.fecharModalAdicionar(), 1800);

    } catch {
      this.alertaAdicionar = 'Erro ao conectar ao servidor.';
    }
  }

  // ═══════════════════════════════════════
  // BOLETIM
  // ═══════════════════════════════════════

  boletins: Record<number, any[] | undefined> = {};
  bimestreSelecionado: number = 1;

  getBoletim(alunoId: number): any[] {       
    return this.boletins[alunoId] ?? [];
  }

  async carregarBoletins(): Promise<void> {
    for (const aluno of this.alunos) {
      try {
        const res = await fetch(
          `${this.API}/boletim/${aluno.id}?bimestre=${this.bimestreSelecionado}`
        );
        const dados = await res.json();
        this.boletins[aluno.id] = res.ok ? dados : [];
      } catch {
        this.boletins[aluno.id] = [];
      }
    }
  }

  // ═══════════════════════════════════════
  // RECADOS
  // ═══════════════════════════════════════

  recados: any[] = [];

  get recadosNaoLidos(): number {
    return this.recados.filter(r => !r.lido).length;
  }

  async carregarRecados(): Promise<void> {
    try {
      const ids = this.alunos.map(a => a.id).join(',');

      if (!ids) return;

      const res = await fetch(`${this.API}/recados/responsavel?alunos=${ids}`);
      const dados = await res.json();

      if (res.ok) {
        this.recados = dados;
      }
    } catch {
      console.error('Erro ao carregar recados');
    }
  }

  async lerRecado(recado: any): Promise<void> {
    if (recado.lido) return;

    try {
      await fetch(`${this.API}/recados/${recado.id}/lido`, { method: 'PATCH' });
      recado.lido = true;
    } catch {
      console.error('Erro ao marcar recado como lido');
    }
  }

  // ═══════════════════════════════════════
  // BADGE DE CONDIÇÃO
  // ═══════════════════════════════════════

  badgeCondicao(condicao: string): string {
    if (!condicao || condicao === 'Nenhuma') return 'bc-nenhuma';

    const c = condicao.toLowerCase();
    if (c.includes('autismo') || c.includes('tea')) return 'bc-autismo';
    if (c.includes('visual'))   return 'bc-visual';
    if (c.includes('auditiva')) return 'bc-auditiva';
    if (c.includes('tdah'))     return 'bc-tdah';
    if (c.includes('dislexia')) return 'bc-dislexia';
    if (c.includes('down'))     return 'bc-down';

    return 'bc-outra';
  }

  // ═══════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════

  logout(): void {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');

    if (!raw) {
      window.location.href = '/login';
      return;
    }

    this.usuario = JSON.parse(raw);

    if (this.usuario.tipo !== 'responsavel') {
      window.location.href = '/login';
      return;
    }

    const agora = new Date();
    this.dataAtual = agora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    this.carregarAlunos();
    this.carregarRecados();
  }
}