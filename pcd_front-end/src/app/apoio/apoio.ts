import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apoio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apoio.html',
  styleUrl: './apoio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Apoio implements OnInit {

  private readonly API = 'http://localhost:3000';

  constructor(private cdr: ChangeDetectorRef) { }

  usuario: any = null;
  dataAtual: string = '';

  get iniciais(): string {
    const partes = (this.usuario?.nome || '').split(' ');
    return (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
  }

  get primeiroNome(): string {
    return this.usuario?.nome?.split(' ')[0] ?? '';
  }

  abaAtual: string = 'dashboard';
  abaConfig: string = 'sobre';

  setAba(aba: string): void {
    this.abaAtual = aba;
    if (aba === 'recados') this.carregarRecados();
  }

  aluno: any = null;
  alunos: any[] = [];
  totalTarefas: number = 0;
  filtroSerie: string = '';

  get seriesDisponiveis(): string[] {
    const series = this.alunos
      .map(a => a.serie)
      .filter(s => s && s !== 'Sem informação');
    return [...new Set(series)] as string[];
  }

  get alunosFiltrados(): any[] {
    if (!this.filtroSerie) return this.alunos;
    return this.alunos.filter(a => a.serie === this.filtroSerie);
  }

  async carregarAluno(): Promise<void> {
    try {
      const res = await fetch(`${this.API}/apoio/aluno/${this.usuario.id}`);
      const dados = await res.json();

      if (res.ok && dados.alunos && dados.alunos.length > 0) {
        this.alunos = dados.alunos;
        this.aluno = dados.alunos[0];

        let totalPendentes = 0;
        let totalConcluidas = 0;

        for (const a of dados.alunos) {
          const rP = await fetch(`${this.API}/tarefas/pendentes/${a.id}`);
          const dP = await rP.json();
          a.tarefasPendentes = dP.pendentes ?? 0;
          totalPendentes += a.tarefasPendentes;

          const rC = await fetch(`${this.API}/tarefas/concluidas/${a.id}`);
          const dC = await rC.json();
          a.tarefasConcluidas = dC.concluidas ?? 0;
          totalConcluidas += a.tarefasConcluidas;
        }

        this.aluno.tarefasPendentes = totalPendentes;
        this.aluno.tarefasConcluidas = totalConcluidas;
        this.totalTarefas = totalPendentes + totalConcluidas;
        await this.carregarRecados();
        this.cdr.markForCheck();
      } else {
        this.alunos = [];
        this.aluno = null;
        this.cdr.markForCheck();
      }
    } catch (e) {
      console.error('Erro ao carregar aluno', e);
    }
  }

  async adicionarAluno(): Promise<void> {
    const email = this.emailAlunoParaAdicionar.trim();
    this.adicionandoAluno = true;

    try {
      const res = await fetch(`${this.API}/apoio/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apoioId: this.usuario.id,
          emailAluno: email
        })
      });

      const dados = await res.json();

      if (!res.ok) {
        this.alertaAdicionar = dados.mensagem || `Erro ${res.status}`;
        return;
      }

      this.alertaAdicionar = 'Aluno vinculado com sucesso!';
      this.aluno = null;
      this.alunos = [];
      this.totalTarefas = 0;
      this.recados = [];

      await this.carregarAluno();
      setTimeout(() => this.fecharModalAdicionar(), 1500);
    } catch {
      this.alertaAdicionar = 'Erro ao conectar ao servidor.';
    } finally {
      this.adicionandoAluno = false;
    }
  }

  modalAdicionarAberto = false;
  emailAlunoParaAdicionar = '';
  alertaAdicionar = '';
  adicionandoAluno = false;

  abrirModalAdicionar(): void {
    this.modalAdicionarAberto = true;
    this.emailAlunoParaAdicionar = '';
    this.alertaAdicionar = '';
  }

  fecharModalAdicionar(): void {
    this.modalAdicionarAberto = false;
    this.alertaAdicionar = '';
  }

  recados: any[] = [];

  get recadosNaoLidos(): number {
    return this.recados.filter(r => !r.lido).length;
  }

  async carregarRecados(): Promise<void> {
    if (!this.aluno) return;
    try {
      const res = await fetch(
        `${this.API}/recados/responsavel?alunos=${this.aluno.id}&usuarioId=${this.usuario.id}`
      );
      const dados = await res.json();
      if (res.ok) {
        this.recados = dados;
        this.cdr.markForCheck();
      }
    } catch {
      console.error('Erro ao carregar recados');
    }
  }

  async lerRecado(recado: any): Promise<void> {
    if (recado.lido) return;
    try {
      await fetch(`${this.API}/recados/${recado.id}/lido`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: this.usuario.id })
      });
      recado.lido = true;
    } catch {
      console.error('Erro ao marcar recado como lido');
    }
  }

  modalRecadoAberto = false;
  alertaRecado = '';
  recadoAlunoId: string = '';
  novoRecado = { titulo: '', mensagem: '' };

  abrirModalRecado(): void {
    this.modalRecadoAberto = true;
    this.alertaRecado = '';
    this.novoRecado = { titulo: '', mensagem: '' };
    this.recadoAlunoId = '';
  }

  fecharModalRecado(): void {
    this.modalRecadoAberto = false;
    this.alertaRecado = '';
  }

  async enviarRecado(): Promise<void> {
    if (!this.novoRecado.titulo || !this.novoRecado.mensagem) {
      this.alertaRecado = 'Preencha o título e a mensagem.';
      return;
    }

    try {
      const res = await fetch(`${this.API}/recados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: this.usuario.id,
          alunoId: this.recadoAlunoId || null,
          titulo: this.novoRecado.titulo,
          mensagem: this.novoRecado.mensagem
        })
      });

      const dados = await res.json();

      if (!res.ok) {
        this.alertaRecado = dados.mensagem || `Erro ${res.status}`;
        return;
      }

      this.alertaRecado = 'Recado enviado com sucesso!';
      setTimeout(() => this.fecharModalRecado(), 1500);
    } catch {
      this.alertaRecado = 'Erro ao conectar ao servidor.';
    }
  }

  sair(): void {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }

    this.usuario = JSON.parse(raw);

    if (this.usuario.tipo !== 'apoio') {
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

    this.carregarAluno();
  }
}