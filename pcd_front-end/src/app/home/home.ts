import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  usuario: any = null;
  iniciais = '';
  dataAtual = '';
  sidebarCollapsed = false;

  totalTarefas = 0;
  tarefasRecentes: any[] = [];

  totalRecadosNaoLidos = 0;
  recadosRecentes: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarDataAtual();
  }

  carregarUsuario(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : (partes[0]?.[0] || '?')).toUpperCase();
    this.carregarTarefas();
    this.carregarRecados();
  }

  carregarDataAtual(): void {
    const agora = new Date();
    const dias  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;
  }

  async carregarTarefas(): Promise<void> {
    if (!this.usuario?.id) return;
    try {
      const res = await fetch(`${API}/tarefas/aluno/${this.usuario.id}`);
      if (res.ok) {
        const dados = await res.json();
        const pendentes = (dados.tarefas || []).filter((t: any) =>
          t.concluida === 0 || t.concluida === false
        );
        this.totalTarefas    = pendentes.length;
        this.tarefasRecentes = pendentes.slice(0, 3);
        this.cdr.detectChanges(); // ✅ força atualização da tela
      }
    } catch { /* sem conexão */ }
  }

  async carregarRecados(): Promise<void> {
    if (!this.usuario?.id) return;
    try {
      const res = await fetch(`${API}/recados/aluno/${this.usuario.id}`);
      if (res.ok) {
        const dados = await res.json();
        const todos    = dados.recados || [];
        const naoLidos = todos.filter((r: any) => r.lido === 0 || r.lido === false);
        this.totalRecadosNaoLidos = naoLidos.length;
        this.recadosRecentes      = naoLidos.slice(0, 2);
        this.cdr.detectChanges(); // ✅ força atualização da tela
      }
    } catch { /* sem conexão */ }
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}