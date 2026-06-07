import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
    private cdr: ChangeDetectorRef
  ) { }

  // ═══════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════

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

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarProfessores();
  }

  // ═══════════════════════════════════════
  // CARREGAR
  // ═══════════════════════════════════════

  async carregarProfessores(): Promise<void> {
    this.carregando = true;
    try {
      const res = await fetch('http://localhost:3000/usuarios/professores');
      const dados = await res.json();
      this.professores = dados.professores || [];
      this.professoresFiltrados = [...this.professores];
      this.disciplinas = [...new Set<string>(
        this.professores.map(p => p.disciplina).filter(Boolean)
      )].sort();
    } catch {
      console.error('Erro ao carregar professores');
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }


  // ═══════════════════════════════════════
  // FILTROS
  // ═══════════════════════════════════════
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

  onBusca(): void {
    this.filtrar();
  }

  // ═══════════════════════════════════════
  // DETALHE
  // ═══════════════════════════════════════

  verProfessor(professor: any): void {
    this.professorSelecionado = professor;
  }

  // ═══════════════════════════════════════
  // APAGAR
  // ═══════════════════════════════════════

  confirmarApagar(professor: any): void {
    this.professorParaApagar = professor;
  }

  cancelarApagar(): void {
    this.professorParaApagar = null;
    this.apagando = false;
  }

  async apagarProfessor(): Promise<void> {
    if (!this.professorParaApagar) return;
    this.apagando = true;
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${this.professorParaApagar.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        this.professores = this.professores.filter(p => p.id !== this.professorParaApagar.id);
        this.filtrar();
        this.disciplinas = [...new Set<string>(
          this.professores.map(p => p.disciplina).filter(Boolean)
        )].sort();
        this.cancelarApagar();
      } else {
        alert('Erro ao apagar.');
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      this.apagando = false;
      this.cdr.detectChanges();
    }
  }

  // ═══════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════

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

  voltarDashboard(): void {
    this.router.navigate(['/coordenador']);
  }

  sair(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }
}