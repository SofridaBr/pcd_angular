import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../service/api';

@Component({
  selector: 'app-comunicacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicacao.html',
  styleUrl: './comunicacao.scss'
})
export class Comunicacao implements OnInit {

  constructor(private router: Router, private cdr: ChangeDetectorRef, private api: Api) { }

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
    const usuario = this.api.getUsuario();
    if (!usuario) { this.router.navigate(['/login']); return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuario;

    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarRecados();
    this.carregarDestinatarios();
  }

  async carregarRecados(): Promise<void> {
    this.carregando = true;
    const res = await this.api.get(`/recados/coordenador/${this.usuario.id}`);
    if (res.status) {
      this.recadosEnviados = res.dados.recados || [];
    } else {
      console.error('Erro ao carregar recados');
    }
    this.carregando = false;
    this.cdr.detectChanges();
  }

  async carregarDestinatarios(): Promise<void> {
    let endpoint = '';
    if (this.filtroTipo === 'aluno') endpoint = '/alunos/todos';
    else if (this.filtroTipo === 'professor') endpoint = '/usuarios/professores';
    else if (this.filtroTipo === 'responsavel') endpoint = '/usuarios/responsaveis';
    else return;

    const res = await this.api.get(endpoint);
    if (res.status) {
      if (this.filtroTipo === 'aluno') this.destinatarios = res.dados.alunos || [];
      else if (this.filtroTipo === 'professor') this.destinatarios = res.dados.professores || [];
      else if (this.filtroTipo === 'responsavel') this.destinatarios = res.dados.responsaveis || [];
    }
    this.novoRecado.destinatarioId = null;
    this.cdr.detectChanges();
  }

  onFiltroTipoChange(): void { this.carregarDestinatarios(); }

  abrirModal(): void {
    this.modalAberto = true;
    this.novoRecado = { destinatarioId: null, titulo: '', mensagem: '' };
    this.msgFeedback = '';
    this.erro = false;
  }

  fecharModal(): void { this.modalAberto = false; }

  async enviarRecado(): Promise<void> {
    if (!this.novoRecado.titulo.trim() || !this.novoRecado.mensagem.trim()) {
      this.msgFeedback = 'Preencha o título e a mensagem.';
      this.erro = true;
      return;
    }

    this.enviando = true;
    this.msgFeedback = '';

    let res: any;

    if (this.filtroTipo === 'professor') {
      res = await this.api.post('/recados/coordenador', {
        remetenteId: this.usuario.id,
        professorId: this.novoRecado.destinatarioId,
        titulo: this.novoRecado.titulo,
        mensagem: this.novoRecado.mensagem
      });
    } else if (this.filtroTipo === 'responsavel') {
      res = await this.api.post('/recados/coordenador/responsavel', {
        remetenteId: this.usuario.id,
        responsavelId: this.novoRecado.destinatarioId,
        titulo: this.novoRecado.titulo,
        mensagem: this.novoRecado.mensagem
      });
    } else {
      // aluno
      const body: any = {
        professorId: this.usuario.id,
        titulo: this.novoRecado.titulo,
        mensagem: this.novoRecado.mensagem
      };
      if (this.novoRecado.destinatarioId) {
        body.alunoId = this.novoRecado.destinatarioId;
      }
      res = await this.api.post('/recados', body);
    }

    if (res.status) {
      this.msgFeedback = '✅ Recado enviado com sucesso!';
      this.erro = false;
      await this.carregarRecados();
      setTimeout(() => this.fecharModal(), 1200);
    } else {
      this.msgFeedback = '❌ ' + (res.dados?.mensagem || 'Erro ao enviar.');
      this.erro = true;
    }

    this.enviando = false;
    this.cdr.detectChanges();
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

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void { this.router.navigate([rota]); }
}