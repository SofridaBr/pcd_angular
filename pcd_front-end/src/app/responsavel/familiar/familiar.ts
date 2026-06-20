import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
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

  private readonly API = 'https://educainclusiva-backend-hvvz.onrender.com';

  usuario: any = null;
  dataAtual: string = '';

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  private getHeaders(): HeadersInit {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  get inicialNome(): string {
    return this.usuario?.nome?.[0]?.toUpperCase() ?? '?';
  }

  get primeiroNome(): string {
    return this.usuario?.nome?.split(' ')[0] ?? '';
  }

  abaAtual: string = 'home';
  abaConfig: string = 'sobre';

  setAba(aba: string): void {
    this.abaAtual = aba;
    if (aba === 'boletim') this.carregarBoletins();
    if (aba === 'recados') this.carregarRecados();
  }

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

  get tituloPagina(): string {
    const titulos: Record<string, string> = {
      home: 'Home',
      alunos: 'Meus Alunos',
      progresso: 'Progresso',
      boletim: 'Boletim',
      recados: 'Recados',
      configuracoes: 'Configurações'
    };
    return titulos[this.abaAtual] || 'Home';
  }


  async carregarAlunos(): Promise<void> {
    try {
      const res = await fetch(`${this.API}/responsavel/alunos/${this.usuario.id}`, {
        headers: this.getHeaders()
      });
      const dados = await res.json();

      if (res.ok) {
        for (const aluno of dados) {
          const r = await fetch(`${this.API}/tarefas/pendentes/${aluno.id}`, {
            headers: this.getHeaders()
          });
          const d = await r.json();
          aluno.tarefasPendentes = d.pendentes;

          const r2 = await fetch(`${this.API}/tarefas/concluidas/${aluno.id}`, {
            headers: this.getHeaders()
          });
          const d2 = await r2.json();
          aluno.tarefasConcluidas = d2.concluidas;
        }

        this.ngZone.run(() => {
          this.alunos = [...dados];
          this.cdr.detectChanges();
        });

        await this.carregarRecados();
      }
    } catch {
      console.error('Erro ao carregar alunos');
    }
  }


  alunoSelecionado: any = null;

  verAluno(aluno: any): void {
    this.alunoSelecionado = aluno;
  }

  verBoletimAluno(aluno: any): void {
    this.alunoSelecionado = null;
    this.abaAtual = 'boletim';
    this.carregarBoletins();
  }

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
        headers: this.getHeaders(),
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

      setTimeout(async () => {
        await this.carregarAlunos();
        this.ngZone.run(() => {
          this.modalAdicionarAberto = false;
          this.abaAtual = 'alunos';
          setTimeout(() => this.abaAtual = 'home', 50);
        });
      }, 1200);

    } catch {
      this.alertaAdicionar = 'Erro ao conectar ao servidor.';
    }
  }

  boletins: Record<number, any[] | undefined> = {};
  bimestreSelecionado: number = 1;

  getBoletim(alunoId: number): any[] {
    return this.boletins[alunoId] ?? [];
  }

  async carregarBoletins(): Promise<void> {
    const bimestre = Number(this.bimestreSelecionado);
    this.boletins = {};
    for (const aluno of this.alunos) {
      try {
        const res = await fetch(`${this.API}/boletim/${aluno.id}?bimestre=${bimestre}`, {
          headers: this.getHeaders()
        });
        const dados = await res.json();
        this.boletins = {
          ...this.boletins,
          [aluno.id]: res.ok ? dados.boletim : []
        };
        this.cdr.detectChanges();
      } catch {
        this.boletins[aluno.id] = [];
      }
    }
  }

  recados: any[] = [];

  get recadosNaoLidos(): number {
    return this.recados.filter(r => !r.lido).length;
  }

  async carregarRecados(): Promise<void> {
    try {
      const ids = this.alunos.map(a => a.id).join(',');

      const res = await fetch(`${this.API}/recados/responsavel?alunos=${ids}&usuarioId=${this.usuario.id}`, {
        headers: this.getHeaders()
      });
      const dados = await res.json();

      if (res.ok) {
        this.recados = dados;
        this.cdr.detectChanges();
      }
    } catch {
      console.error('Erro ao carregar recados');
    }
  }

  recadoSelecionado: any = null;

  lerRecado(recado: any): void {
    this.recadoSelecionado = recado;
    if (!recado.lido) {
      fetch(`${this.API}/recados/${recado.id}/lido`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ usuarioId: this.usuario.id })
      });
      recado.lido = true;
      this.cdr.detectChanges();
    }
  }

  fecharRecado(): void {
    this.recadoSelecionado = null;
  }

  badgeCondicao(condicao: string): string {
    if (!condicao || condicao === 'Nenhuma') return 'bc-nenhuma';
    const c = condicao.toLowerCase();
    if (c.includes('autismo') || c.includes('tea')) return 'bc-autismo';
    if (c.includes('visual')) return 'bc-visual';
    if (c.includes('auditiva')) return 'bc-auditiva';
    if (c.includes('tdah')) return 'bc-tdah';
    if (c.includes('dislexia')) return 'bc-dislexia';
    if (c.includes('down')) return 'bc-down';
    return 'bc-outra';
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

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
  }
}