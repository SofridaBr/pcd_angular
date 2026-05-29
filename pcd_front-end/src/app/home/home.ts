import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarDataAtual();
    this.carregarTarefas();
  }

  carregarUsuario(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      window.location.href = '/login';
      return;
    }
    this.usuario = JSON.parse(raw);

    // Gerar iniciais
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : (partes[0]?.[0] || '?');
    this.iniciais = this.iniciais.toUpperCase();
  }

  carregarDataAtual(): void {
    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;
  }

  async carregarTarefas(): Promise<void> {
    if (!this.usuario?.id) return;
    try {
      const res = await fetch(`http://localhost:3000/tarefas/aluno/${this.usuario.id}`);
      if (res.ok) {
        const dados = await res.json();
        const pendentes = (dados.tarefas || []).filter((t: any) => !t.concluida);
        this.totalTarefas = pendentes.length;
        this.tarefasRecentes = pendentes.slice(0, 3);
      }
    } catch {
      // Sem tarefas
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  sair(): void {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}