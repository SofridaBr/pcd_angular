import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todos-cuidadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-cuidadores.html',
  styleUrl: './todos-cuidadores.scss'
})
export class TodosCuidadores implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  usuario: any = null;
  cuidadores: any[] = [];
  cuidadoresFiltrados: any[] = [];
  carregando = true;

  busca = '';
  cuidadorSelecionado: any = null;
  cuidadorParaApagar: any = null;
  apagando = false;

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);
    if (this.usuario.tipo !== 'coordenador') { this.router.navigate(['/login']); return; }
    this.carregarCuidadores();
  }

  async carregarCuidadores(): Promise<void> {
    this.carregando = true;
    try {
      const token = localStorage.getItem('token');  // ← ADD
      const res = await fetch('https://educainclusiva-backend-hvvz.onrender.com/usuarios/cuidadores', {
        headers: { 'Authorization': `Bearer ${token}` }  // ← ADD
      });
      const dados = await res.json();
      this.cuidadores = dados.cuidadores || [];
      this.cuidadoresFiltrados = [...this.cuidadores];
    } catch {
      console.error('Erro ao carregar cuidadores');
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  filtrar(): void {
    let lista = [...this.cuidadores];
    if (this.busca.trim()) {
      const termo = this.busca.toLowerCase();
      lista = lista.filter(c =>
        c.nome?.toLowerCase().includes(termo) ||
        c.email?.toLowerCase().includes(termo)
      );
    }
    this.cuidadoresFiltrados = lista;
  }

  onBusca(): void { this.filtrar(); }

  verCuidador(cuidador: any): void {
    this.cuidadorSelecionado = cuidador;
  }

  confirmarApagar(cuidador: any): void {
    this.cuidadorParaApagar = cuidador;
  }

  cancelarApagar(): void {
    this.cuidadorParaApagar = null;
    this.apagando = false;
  }

  async apagarCuidador(): Promise<void> {
    if (!this.cuidadorParaApagar) return;
    this.apagando = true;
    try {
      const res = await fetch(`https://educainclusiva-backend-hvvz.onrender.com/usuarios/${this.cuidadorParaApagar.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }  // ← ADD
      });
      if (res.ok) {
        this.cuidadores = this.cuidadores.filter(c => c.id !== this.cuidadorParaApagar.id);
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