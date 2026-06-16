import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../service/api';

@Component({
  selector: 'app-todos-professores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-professores.html',
  styleUrl: './todos-professores.scss'
})
export class TodosProfessores implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: Api
  ) { }

  usuario: any = null;
  professores: any[] = [];
  professoresFiltrados: any[] = [];
  carregando = true;

  busca = '';
  filtroDisciplina = 'Todas';
  disciplinas: string[] = [];
  filtroTipo = 'Todos';

  professorSelecionado: any = null;
  professorParaApagar: any = null;
  apagando = false;

  ngOnInit(): void {
    const usuario = this.api.getUsuario();
    if (!usuario) { this.router.navigate(['/login']); return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuario;

    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarProfessores();
  }

  async carregarProfessores(): Promise<void> {
    this.carregando = true;
    const res = await this.api.get('/usuarios/professores');
    if (res.status) {
      this.professores = res.dados.professores || [];
      this.professoresFiltrados = [...this.professores];
      this.disciplinas = [...new Set<string>(
        this.professores.map((p: any) => p.disciplina).filter(Boolean)
      )].sort();
    } else {
      console.error('Erro ao carregar professores');
    }
    this.carregando = false;
    this.cdr.detectChanges();
  }

  filtrar(): void {
    let lista = [...this.professores];
    if (this.filtroDisciplina !== 'Todas') {
      lista = lista.filter(p => p.disciplina === this.filtroDisciplina);
    }
    if (this.busca.trim()) {
      const termo = this.busca.toLowerCase();
      lista = lista.filter(p =>
        p.nome?.toLowerCase().includes(termo) ||
        p.email?.toLowerCase().includes(termo)
      );
    }
    this.professoresFiltrados = lista;
  }

  selecionarDisciplina(disciplina: string): void {
    this.filtroDisciplina = disciplina;
    this.filtrar();
  }

  selecionarTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.filtrar();
  }

  onBusca(): void { this.filtrar(); }

  verProfessor(professor: any): void { this.professorSelecionado = professor; }

  confirmarApagar(professor: any): void { this.professorParaApagar = professor; }

  cancelarApagar(): void {
    this.professorParaApagar = null;
    this.apagando = false;
  }

  async apagarProfessor(): Promise<void> {
    if (!this.professorParaApagar) return;
    this.apagando = true;
    const res = await this.api.delete(`/usuarios/${this.professorParaApagar.id}`);
    if (res.status) {
      this.professores = this.professores.filter(p => p.id !== this.professorParaApagar.id);
      this.filtrar();
      this.disciplinas = [...new Set<string>(
        this.professores.map((p: any) => p.disciplina).filter(Boolean)
      )].sort();
      this.cancelarApagar();
    } else {
      alert('Erro ao apagar.');
    }
    this.apagando = false;
    this.cdr.detectChanges();
  }

  getIniciais(nome: string): string {
    return nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  getTipoBadgeClass(tipo: string): string {
    const map: any = {
      'professor': 'badge-professor',
      'apoio': 'badge-apoio',
      'coordenador': 'badge-coordenador'
    };
    return map[tipo] || 'badge-outra';
  }

  getTipoLabel(tipo: string): string {
    const map: any = {
      'professor': 'Professor',
      'apoio': 'Apoio',
      'coordenador': 'Coordenador'
    };
    return map[tipo] || tipo;
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