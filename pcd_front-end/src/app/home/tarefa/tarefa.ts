import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../service/api';

@Component({
  selector: 'app-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tarefa.html',
  styleUrl: './tarefa.scss',
})
export class Tarefa implements OnInit {

  // ── Propriedades existentes ──────────────────
  tipoUsuario: string = '';
  usuarioId: number = 0;
  modalAberto = false;
  tarefas: any[] = [];
  totalRecadosNaoLidos = 0;

  novaTarefa = {
    titulo: '', materia: '', descricao: '',
    link: '', banner: '', concluida: false,
  };

  // ── Propriedades novas ───────────────────────
  usuario: any = null;
  iniciais = '';
  dataAtual = '';
  sidebarCollapsed = false;
  filtroMateria = '';
  filtroStatus = '';
  materias = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Inglês', 'Educação Física', 'Artes'];

  get totalPendentes(): number {
    return this.tarefas.filter(t => !t.concluida).length;
  }

  get tarefasFiltradas(): any[] {
    return this.tarefas.filter(t => {
      const okMateria = !this.filtroMateria || t.materia === this.filtroMateria;
      const okStatus = !this.filtroStatus ||
        (this.filtroStatus === 'pendente' && !t.concluida) ||
        (this.filtroStatus === 'concluida' && t.concluida);
      return okMateria && okStatus;
    });
  }

  constructor(private api: Api, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const usuarioToken = this.api.getUsuario();
    if (!usuarioToken) { this.router.navigate(['/login']); return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    const usuario = raw ? JSON.parse(raw) : usuarioToken;

    this.tipoUsuario = usuario.tipo;
    this.usuarioId = usuario.id;

    // Dados pra sidebar
    this.usuario = usuario;
    const partes = (usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;

    this.carregarTarefas();
    this.carregarRecados();
  }
  async carregarTarefas(): Promise<void> {
    if (this.tipoUsuario === 'aluno') {
      const res = await this.api.get(`/tarefas/aluno/${this.usuarioId}`);
      if (res.status) {
        this.tarefas = res.dados.tarefas.map((t: any) => ({
          ...t,
          concluida: t.concluida === 1 || t.concluida === true
        }));
        this.cdr.detectChanges();
      } else {
        console.error('❌ Erro ao carregar tarefas');
      }
    } else {
      const res = await this.api.get(`/tarefas/professor/${this.usuarioId}`);
      if (res.status) {
        this.tarefas = res.dados.tarefas;
        this.cdr.detectChanges();
      } else {
        console.error('Erro ao carregar tarefas do professor');
      }
    }
  }

  async carregarRecados(): Promise<void> {
    if (!this.usuarioId) return;
    const res = await this.api.get(`/recados/aluno/${this.usuarioId}`);
    if (res.status) {
      const naoLidos = (res.dados.recados || []).filter((r: any) => r.lido === 0 || r.lido === false);
      this.totalRecadosNaoLidos = naoLidos.length;
      this.cdr.detectChanges();
    }
  }

  abrirModal() { this.modalAberto = true; }
  fecharModal() { this.modalAberto = false; }

  criarTarefa() {
    if (!this.novaTarefa.titulo || !this.novaTarefa.link) return;
    this.router.navigate(['/professor']);
    this.fecharModal();
  }

  async marcarConcluida(tarefa: any): Promise<void> {
    if (tarefa.concluida) return;
    const res = await this.api.post('/tarefas/concluir', {
      tarefaId: tarefa.id, alunoId: this.usuarioId
    });
    if (res.status) {
      tarefa.concluida = true;
      this.cdr.detectChanges();
    } else {
      console.error('Erro:', res.dados);
      alert('Erro ao salvar.');
    }
  }

  isValidUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('http') && !url.includes('forms.gle') &&
      (url.includes('.jpg') || url.includes('.png') ||
        url.includes('.jpeg') || url.includes('.webp') || url.includes('.gif'));
  }

  // ── Métodos novos ────────────────────────────
  aplicarFiltros() { }

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}