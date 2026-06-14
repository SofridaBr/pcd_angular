import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../service/api';

@Component({
  selector: 'app-todos-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-alunos.html',
  styleUrl: './todos-alunos.scss'
})
export class TodosAlunos implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: Api
  ) { }

  sidebarAberta = true;
  usuario: any = null;
  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  carregando = true;

  busca = '';
  filtroSerie = 'Todas';
  series: string[] = [];

  alunoParaApagar: any = null;
  apagando = false;
  alunoSelecionado: any = null;

  ngOnInit(): void {
    const usuario = this.api.getUsuario();
    if (!usuario) { this.router.navigate(['/login']); return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuario;

    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarAlunos();
  }

  async carregarAlunos(): Promise<void> {
    this.carregando = true;
    const res = await this.api.get('/alunos/todos');
    if (res.status) {
      this.alunos = res.dados.alunos || [];
      this.alunosFiltrados = [...this.alunos];
      this.series = [...new Set<string>(
        this.alunos.map((a: any) => a.serie).filter(Boolean)
      )].sort();
    } else {
      console.error('Erro ao carregar alunos');
    }
    this.carregando = false;
    this.cdr.detectChanges();
  }

  filtrar(): void {
    let lista = [...this.alunos];
    if (this.filtroSerie !== 'Todas') {
      lista = lista.filter(a => (a.serie || 'Sem informação') === this.filtroSerie);
    }
    if (this.busca.trim()) {
      const termo = this.busca.toLowerCase();
      lista = lista.filter(a =>
        a.nome?.toLowerCase().includes(termo) ||
        a.email?.toLowerCase().includes(termo)
      );
    }
    this.alunosFiltrados = lista;
  }

  selecionarSerie(serie: string): void {
    this.filtroSerie = serie;
    this.filtrar();
  }

  onBusca(): void { this.filtrar(); }

  toggleSidebar(): void { this.sidebarAberta = !this.sidebarAberta; }

  getIniciais(nome: string): string {
    return nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  getCondicaoBadgeClass(condicao: string): string {
    const map: any = {
      'Autismo Nível 1': 'badge-tea', 'Autismo Nível 2': 'badge-tea',
      'Autismo Nível 3': 'badge-tea', 'Deficiência Visual': 'badge-visual',
      'Deficiência Auditiva': 'badge-auditiva', 'Deficiência Física': 'badge-fisica',
      'Deficiência Intelectual': 'badge-cognitiva', 'TDAH': 'badge-tdah',
      'Dislexia': 'badge-dislexia', 'Síndrome de Down': 'badge-down',
      'Paralisia Cerebral': 'badge-pc', 'Nenhuma': 'badge-nenhuma'
    };
    return map[condicao] || 'badge-outra';
  }

  getProgressoClass(p: number): string {
    if (p >= 70) return 'bom';
    if (p >= 40) return 'medio';
    return 'critico';
  }

  voltarDashboard(): void { this.router.navigate(['/coordenador']); }

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void { this.router.navigate([rota]); }

  confirmarApagar(aluno: any): void { this.alunoParaApagar = aluno; }

  cancelarApagar(): void {
    this.alunoParaApagar = null;
    this.apagando = false;
  }

  async apagarAluno(): Promise<void> {
    if (!this.alunoParaApagar) return;
    this.apagando = true;
    const res = await this.api.delete(`/alunos/${this.alunoParaApagar.id}`);
    if (res.status) {
      this.alunos = this.alunos.filter(a => a.id !== this.alunoParaApagar.id);
      this.filtrar();
      this.series = [...new Set<string>(
        this.alunos.map((a: any) => a.serie).filter(Boolean)
      )].sort();
      this.cancelarApagar();
    } else {
      alert('Erro ao apagar aluno.');
    }
    this.apagando = false;
    this.cdr.detectChanges();
  }

  verAluno(aluno: any): void { this.alunoSelecionado = aluno; }
}