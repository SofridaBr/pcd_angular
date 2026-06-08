import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comunicacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicacao.html',
  styleUrl: './comunicacao.scss'
})
export class Comunicacao implements OnInit {

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  usuario: any = null;
  carregando = true;
  recadosEnviados: any[] = [];
  modalAberto = false;
  enviando = false;
  msgFeedback = '';
  erro = false;

  destinatarios: any[] = [];
  filtroTipo = 'aluno';

  novoRecado = {
    destinatarioId: null as number | null,
    titulo: '',
    mensagem: ''
  };

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarRecados();
    this.carregarDestinatarios();
  }

  async carregarRecados(): Promise<void> {
    this.carregando = true;
    try {
      const res = await fetch(`http://localhost:3000/recados/professor/${this.usuario.id}`);
      const dados = await res.json();
      this.recadosEnviados = dados.recados || [];
    } catch {
      console.error('Erro ao carregar recados');
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  async carregarDestinatarios(): Promise<void> {
    try {
      let url = '';
      if (this.filtroTipo === 'aluno') url = 'http://localhost:3000/alunos/todos';
      else if (this.filtroTipo === 'professor') url = 'http://localhost:3000/usuarios/professores';
      else if (this.filtroTipo === 'responsavel') url = 'http://localhost:3000/usuarios/responsaveis';

      const res = await fetch(url);
      const dados = await res.json();

      if (this.filtroTipo === 'aluno') this.destinatarios = dados.alunos || [];
      else if (this.filtroTipo === 'professor') this.destinatarios = dados.professores || [];
      else if (this.filtroTipo === 'responsavel') this.destinatarios = dados.responsaveis || [];

      this.novoRecado.destinatarioId = null;
      this.cdr.detectChanges();
    } catch {
      console.error('Erro ao carregar destinatários');
    }
  }

  onFiltroTipoChange(): void {
    this.carregarDestinatarios();
  }

  abrirModal(): void {
    this.modalAberto = true;
    this.novoRecado = { destinatarioId: null, titulo: '', mensagem: '' };
    this.msgFeedback = '';
    this.erro = false;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  async enviarRecado(): Promise<void> {
    if (!this.novoRecado.titulo.trim() || !this.novoRecado.mensagem.trim()) {
      this.msgFeedback = 'Preencha o título e a mensagem.';
      this.erro = true;
      return;
    }

    this.enviando = true;
    this.msgFeedback = '';

    try {
      const body: any = {
        professorId: this.usuario.id,
        titulo: this.novoRecado.titulo,
        mensagem: this.novoRecado.mensagem
      };

      if (this.novoRecado.destinatarioId) {
        body.alunoId = this.novoRecado.destinatarioId;
      }

      const res = await fetch('http://localhost:3000/recados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const dados = await res.json();

      if (res.ok) {
        this.msgFeedback = 'Recado enviado com sucesso!';
        this.erro = false;
        await this.carregarRecados();
        setTimeout(() => this.fecharModal(), 1200);
      } else {
        this.msgFeedback = dados.mensagem || 'Erro ao enviar.';
        this.erro = true;
      }
    } catch {
      this.msgFeedback = 'Erro de conexão.';
      this.erro = true;
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getIniciais(nome: string): string {
    return nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  voltarDashboard(): void { this.router.navigate(['/coordenador']); }
  sair(): void { localStorage.removeItem('usuario'); this.router.navigate(['/login']); }
  navegarPara(rota: string): void { this.router.navigate([rota]); }
}