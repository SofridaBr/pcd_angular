import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todos-responsaveis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-responsaveis.html',
  styleUrl: './todos-responsaveis.scss'
})
export class TodosResponsaveis implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  usuario: any = null;
  responsaveis: any[] = [];
  responsaveisFiltrados: any[] = [];
  carregando = true;

  busca = '';
  responsavelSelecionado: any = null;
  responsavelParaApagar: any = null;
  apagando = false;

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarResponsaveis();
  }

  async carregarResponsaveis(): Promise<void> {
    this.carregando = true;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://educainclusiva-backend-hvwz.onrender.com/usuarios/responsaveis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dados = await res.json();
      this.responsaveis = dados.responsaveis || [];
      this.responsaveisFiltrados = [...this.responsaveis];
    } catch {
      console.error('Erro ao carregar responsáveis');
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  filtrar(): void {
    let lista = [...this.responsaveis];
    if (this.busca.trim()) {
      const termo = this.busca.toLowerCase();
      lista = lista.filter(r =>
        r.nome?.toLowerCase().includes(termo) ||
        r.email?.toLowerCase().includes(termo)
      );
    }
    this.responsaveisFiltrados = lista;
  }

  onBusca(): void { this.filtrar(); }

  verResponsavel(responsavel: any): void {
    this.responsavelSelecionado = responsavel;
  }

  confirmarApagar(responsavel: any): void {
    this.responsavelParaApagar = responsavel;
  }

  cancelarApagar(): void {
    this.responsavelParaApagar = null;
    this.apagando = false;
  }

  async apagarResponsavel(): Promise<void> {
    if (!this.responsavelParaApagar) return;
    this.apagando = true;
    try {
      const res = await fetch(`https://educainclusiva-backend-hvwz.onrender.com/usuarios/${this.responsavelParaApagar.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }  // ← ADD AQUI
      });
      if (res.ok) {
        this.responsaveis = this.responsaveis.filter(r => r.id !== this.responsavelParaApagar.id);
        this.filtrar();
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

  getIniciais(nome: string): string {
    return nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  }

  voltarDashboard(): void { this.router.navigate(['/coordenador']); }
  sair(): void { localStorage.removeItem('usuario'); this.router.navigate(['/login']); }
  navegarPara(rota: string): void { this.router.navigate([rota]); }
}